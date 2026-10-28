import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = getPrismaClient();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, portId } = body;

    // Basic validation
    if (!fullName?.trim() || !phone?.trim() || !email?.trim() || !portId?.trim()) {
      return NextResponse.json({
        success: false,
        error: "Faltan datos requeridos: fullName, phone, email, portId"
      }, { status: 400 });
    }

    // Email format
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: "Email inválido"
      }, { status: 400 });
    }

    // Phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json({
        success: false,
        error: "Teléfono inválido (use formato internacional)"
      }, { status: 400 });
    }

    // Verify port exists
    const port = await prisma.port.findUnique({ where: { id: portId } });
    if (!port) {
      return NextResponse.json({
        success: false,
        error: `Capitanía de puerto no encontrada: ${portId}`
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user - only update name if they are a PUBLIC user
    let userData = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (userData) {
      if (userData.role === "PUBLIC") {
        userData = await prisma.user.update({
          where: { id: userData.id },
          data: { name: fullName.trim() }
        });
      }
    } else {
      userData = await prisma.user.create({
        data: {
          name: fullName.trim(),
          email: normalizedEmail,
          role: "PUBLIC"
        }
      });
    }

    const requestData = await prisma.embarcacionInscripcionRequest.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        portId: portId,
        userId: userData.id
      }
    });

    // Create notification for CIM and Capitanía
    await createNotification({
        title: "Nueva Inspección de Embarcación",
        message: `Solicitante: ${fullName.trim()}. Puerto: ${port.name}`,
        type: "INSPECTION",
        link: `/dashboard/inscripcion-embarcaciones`,
        portId: portId
    });

    return NextResponse.json({ success: true, request: requestData });

  } catch (error: any) {
    console.error("=== Inscripción ERROR ===", error.message);
    return NextResponse.json({
      success: false,
      error: "Error interno al procesar la inscripción"
    }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userRole = session.user.role;
  const userPortId = session.user.portId;

  try {
    const where: any = {};
    if (userRole === "CAPITAN" && userPortId) {
      where.portId = userPortId;
    }

    const requests = await prisma.embarcacionInscripcionRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        port: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        vesselRegistration: true
      }
    });
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Error fetching inscripcion requests:", error.message);
    return NextResponse.json({ success: false, error: "Error al consultar las inscripciones" }, { status: 500 });
  }
}
