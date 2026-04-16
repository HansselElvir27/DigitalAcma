import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildRegistrationNumber, ACTIVITY_CODES } from "@/lib/vessel-codes";
import { saveBase64ToFile, saveMultipleBase64 } from "@/lib/storage";

const prisma = getPrismaClient();
export const dynamic = "force-dynamic";

// POST /api/vessels - Create a new vessel registration or renewal
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "CAPITAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      vesselName, eslora, manga, punta, calado,
      passengerCapacity, crewCapacity, engineBrand, engineSerials,
      ownerId, ownerName, vesselType, activityType,
      phone, address, email, rtn,
      paymentPhoto, vesselPhotos, documents,
      citaNumber, yearBuilt, grossTonnage, netTonnage,
      color, hullMaterial, route, observations,
      issueDate, expirationDate, requestId, portId
    } = body;

    if (!vesselName || !activityType || !portId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Determine an ID for the folder (either use current registration ID or a new one)
    // For new registrations we generate a temp ID if requestId isn't enough
    const storageId = requestId || `vsl-${Date.now()}`;

    // Process files before DB operations
    const savedPaymentPhoto = await saveBase64ToFile(paymentPhoto, 'vessels', storageId, 'payment_receipt');
    const savedVesselPhotos = await saveMultipleBase64(vesselPhotos, 'vessels', storageId);
    const savedDocuments = await saveMultipleBase64(documents, 'vessels', storageId);

    // Create or Update the registration
    let registration;

    if (requestId) {
        const reqDoc = await prisma.embarcacionInscripcionRequest.findUnique({
            where: { id: requestId }
        });

        if (reqDoc?.type === "RENEWAL" && reqDoc.renewalVesselId) {
            // RENEWAL FLOW
            const existingVessel = await prisma.vesselRegistration.findUnique({
                where: { id: reqDoc.renewalVesselId }
            });

            if (existingVessel) {
                // 0. Detect changes for history
                const changedFields: any = {};
                const fieldsToTrack = [
                    "vesselName", "eslora", "manga", "punta", "calado",
                    "passengerCapacity", "crewCapacity", "engineBrand",
                    "ownerId", "ownerName", "vesselType", "activityType",
                    "phone", "address", "email", "rtn",
                    "yearBuilt", "grossTonnage", "netTonnage",
                    "color", "hullMaterial", "route", "observations"
                ];

                fieldsToTrack.forEach(field => {
                    const oldValue = (existingVessel as any)[field] || "";
                    const newValue = (body as any)[field] || "";
                    if (String(oldValue) !== String(newValue)) {
                        changedFields[field] = { old: oldValue, new: newValue };
                    }
                });

                // JSON fields
                if (JSON.stringify(existingVessel.engineSerials) !== JSON.stringify(engineSerials || [])) {
                    changedFields.engineSerials = { old: existingVessel.engineSerials, new: engineSerials || [] };
                }

                // File fields tracking in history
                if (existingVessel.paymentPhoto !== savedPaymentPhoto) {
                    changedFields.paymentPhoto = { old: existingVessel.paymentPhoto, new: savedPaymentPhoto };
                }

                // Date fields
                if (issueDate && new Date(existingVessel.issueDate || 0).getTime() !== new Date(issueDate).getTime()) {
                    changedFields.issueDate = { old: existingVessel.issueDate, new: issueDate };
                }
                if (expirationDate && new Date(existingVessel.expirationDate || 0).getTime() !== new Date(expirationDate).getTime()) {
                    changedFields.expirationDate = { old: existingVessel.expirationDate, new: expirationDate };
                }

                // Decide if registration number changes
                let finalRegNumber = existingVessel.registrationNumber;
                if (existingVessel.activityType !== activityType) {
                    const port = await prisma.port.findUnique({ 
                        where: { id: portId },
                        include: { _count: { select: { vesselRegistrations: true } } }
                    });
                    
                    if (port) {
                        // Find the maximum sequential number already in use for this port
                        const recentRegistrations = await prisma.vesselRegistration.findMany({
                            where: { portId },
                            select: { registrationNumber: true },
                            take: 100,
                            orderBy: { createdAt: 'desc' }
                        });

                        let maxCount = 0;
                        recentRegistrations.forEach(reg => {
                            const parts = reg.registrationNumber.split('-');
                            if (parts.length >= 3) {
                                const seq = parseInt(parts[2], 10);
                                if (!isNaN(seq) && seq > maxCount) maxCount = seq;
                            }
                        });

                        const nextCount = Math.max(port._count.vesselRegistrations, maxCount) + 1;
                        finalRegNumber = buildRegistrationNumber(port.name, nextCount, activityType);
                        changedFields.registrationNumber = { old: existingVessel.registrationNumber, new: finalRegNumber };
                    }
                }

                // 1. Save snapshot to history
                await prisma.vesselRegistrationHistory.create({
                    data: {
                        registrationId: existingVessel.id,
                        registrationNumber: existingVessel.registrationNumber,
                        vesselName: existingVessel.vesselName,
                        eslora: existingVessel.eslora,
                        manga: existingVessel.manga,
                        punta: existingVessel.punta,
                        calado: existingVessel.calado,
                        passengerCapacity: existingVessel.passengerCapacity,
                        crewCapacity: existingVessel.crewCapacity,
                        engineBrand: existingVessel.engineBrand,
                        engineSerials: existingVessel.engineSerials as any,
                        ownerId: existingVessel.ownerId,
                        ownerName: existingVessel.ownerName,
                        vesselType: existingVessel.vesselType,
                        activityType: existingVessel.activityType,
                        phone: existingVessel.phone,
                        address: existingVessel.address,
                        email: existingVessel.email,
                        rtn: existingVessel.rtn,
                        paymentPhoto: existingVessel.paymentPhoto,
                        vesselPhotos: existingVessel.vesselPhotos as any,
                        documents: existingVessel.documents as any,
                        yearBuilt: existingVessel.yearBuilt,
                        grossTonnage: existingVessel.grossTonnage,
                        netTonnage: existingVessel.netTonnage,
                        color: existingVessel.color,
                        hullMaterial: existingVessel.hullMaterial,
                        route: existingVessel.route,
                        observations: existingVessel.observations,
                        issueDate: existingVessel.issueDate,
                        expirationDate: existingVessel.expirationDate,
                        changeReason: "RENEWAL",
                        changedFields: changedFields
                    }
                });

                // 2. Update current registration
                registration = await prisma.vesselRegistration.update({
                    where: { id: existingVessel.id },
                    data: {
                        registrationNumber: finalRegNumber,
                        vesselName, eslora, manga, punta, calado,
                        passengerCapacity, crewCapacity, engineBrand,
                        engineSerials: (engineSerials || []) as any,
                        ownerId, ownerName, vesselType, activityType,
                        activityCode: ACTIVITY_CODES[activityType] ?? 0,
                        phone, address, email, rtn,
                        paymentPhoto: savedPaymentPhoto, 
                        vesselPhotos: JSON.parse(savedVesselPhotos || "[]"),
                        documents: JSON.parse(savedDocuments || "[]"),
                        citaNumber, yearBuilt, grossTonnage, netTonnage,
                        color, hullMaterial, route, observations,
                        issueDate: issueDate ? new Date(issueDate) : new Date(),
                        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
                        status: "ACTIVE",
                        requestId: requestId
                    }
                });
            }
        }
    }

    if (!registration) {
        // NEW REGISTRATION FLOW
        const port = await prisma.port.findUnique({
            where: { id: portId },
            include: { _count: { select: { vesselRegistrations: true } } }
        });

        if (!port) {
            return NextResponse.json({ error: "Puerto no encontrado" }, { status: 404 });
        }

        // Find the maximum sequential number already in use for this port
        const lastRegistration = await prisma.vesselRegistration.findFirst({
            where: { portId },
            orderBy: { createdAt: "desc" }, // Simple heuristic, but we'll fall back to check numbers
            select: { registrationNumber: true }
        });

        // Better: Fetch all recent to find the actual maximum numeric suffix
        const recentRegistrations = await prisma.vesselRegistration.findMany({
            where: { portId },
            select: { registrationNumber: true },
            take: 100, // Look at the last 100 to find the max
            orderBy: { createdAt: 'desc' }
        });

        let maxCount = 0;
        recentRegistrations.forEach(reg => {
            const parts = reg.registrationNumber.split('-');
            if (parts.length >= 3) {
                const seq = parseInt(parts[2], 10);
                if (!isNaN(seq) && seq > maxCount) maxCount = seq;
            }
        });

        const nextCount = Math.max(port._count.vesselRegistrations, maxCount) + 1;
        const registrationNumber = buildRegistrationNumber(port.name, nextCount, activityType);
        const activityCode = ACTIVITY_CODES[activityType] ?? 0;

        registration = await prisma.vesselRegistration.create({
            data: {
                registrationNumber,
                vesselName, eslora, manga, punta, calado,
                passengerCapacity, crewCapacity, engineBrand,
                engineSerials: (engineSerials || []) as any,
                ownerId, ownerName, vesselType, activityType,
                activityCode,
                phone, address, email, rtn,
                paymentPhoto: savedPaymentPhoto,
                vesselPhotos: JSON.parse(savedVesselPhotos || "[]"),
                documents: JSON.parse(savedDocuments || "[]"),
                citaNumber, yearBuilt, grossTonnage, netTonnage,
                color, hullMaterial, route, observations,
                issueDate: issueDate ? new Date(issueDate) : new Date(),
                expirationDate: expirationDate ? new Date(expirationDate) : undefined,
                status: "ACTIVE",
                portId,
                requestId,
                captainId: session.user.id,
                qrCode: `DGMM-REG-${registrationNumber}-${Date.now()}`
            }
        });
    }

    // Mark request as APPROVED
    if (requestId) {
        await prisma.embarcacionInscripcionRequest.update({
            where: { id: requestId },
            data: { status: "APPROVED" }
        });
    }

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    console.error("Error al registrar/renovar embarcación:", error);
    
    // Check for Prisma unique constraint error (P2002)
    if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'matrícula';
        return NextResponse.json({ 
            error: `Conflicto de unicidad: la ${field} ya existe y no puede duplicarse.` 
        }, { status: 409 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/vessels - List registrations
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const portId = searchParams.get("portId");

  try {
    const registrations = await prisma.vesselRegistration.findMany({
      where: {
        AND: [
          portId ? { portId } : {},
          (session.user as any).role === "CAPITAN" ? { portId: (session.user as any).portId } : {}
        ]
      },
      include: {
        port: { select: { name: true } },
        captain: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(registrations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
