import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveBase64ToFile } from "@/lib/storage";
import crypto from "crypto";

const prisma = getPrismaClient();

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "50mb",
        },
    },
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        console.log("Aviso de Arribo Recreativo request received");
        
        const {
            vesselName,
            registrationNum,
            flag,
            departurePort,
            vesselType,
            countryOrigin,
            arrivalPort,
            etaDate,
            personsOnBoard,
            email,
            vesselPhoto
        } = body;

        if (!vesselName || !registrationNum || !flag || !departurePort || !vesselType || 
            !countryOrigin || !arrivalPort || !etaDate || !personsOnBoard || !email) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        const requestId = crypto.randomUUID();

        // Save photo to filesystem
        const photoPath = await saveBase64ToFile(vesselPhoto, 'arribos-recreativos', requestId, 'vessel_photo.jpg');

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find or create public user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            user = await prisma.user.create({ 
                data: { 
                    name: vesselName, 
                    email: normalizedEmail, 
                    role: "PUBLIC" 
                }
            });
        }

        // Create the ArrivalNoticeRecreational
        const newArrivalNotice = await prisma.arrivalNoticeRecreational.create({
            data: {
                id: requestId,
                vesselName,
                registrationNum,
                flag,
                departurePort,
                vesselType,
                countryOrigin,
                arrivalPort,
                etaDate: new Date(etaDate),
                personsOnBoard,
                userId: user.id,
                vesselPhoto: photoPath,
            }
        });

        // Create notification for CIM
        await createNotification({
            title: "Nuevo Arribo Recreativo",
            message: `Embarcación: ${vesselName}. Puerto: ${arrivalPort}. ETA: ${etaDate}`,
            type: "ARRIBO",
            link: `/dashboard/arribos`
        });

        return NextResponse.json({ success: true, request: newArrivalNotice });
    } catch (error: any) {
        console.error("Aviso de Arribo Recreativo Error:", error);
        return NextResponse.json({ error: "Error interno del servidor: " + error.message, details: error.stack }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userRole = session.user.role;
    const userPortId = session.user.portId;

    try {
        let where: any = {};
        if (userRole === "CAPITAN" && userPortId) {
            const port = await prisma.port.findUnique({ where: { id: userPortId } });
            if (port) {
                where.arrivalPort = port.name;
            }
        }

        const notices = await prisma.arrivalNoticeRecreational.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } }
        });

        return NextResponse.json(notices);
    } catch (error: any) {
        console.error("Error fetching recreational arrival notices:", error.message);
        return NextResponse.json({ error: "Error al obtener los avisos" }, { status: 500 });
    }
}
