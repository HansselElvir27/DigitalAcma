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
        
        console.log("Aviso de Arribo request received");
        
        const {
            distinctiveSignal,
            arrivalPort,
            etaDate,
            protectionLevel,
            email,
            vesselName,
            vesselPhoto
        } = body;

        if (!distinctiveSignal || !arrivalPort || !etaDate || !protectionLevel || !email) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        const requestId = crypto.randomUUID();

        // Save photo to filesystem
        const photoPath = await saveBase64ToFile(vesselPhoto, 'arribos', requestId, 'vessel_photo.jpg');

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find or create public user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            user = await prisma.user.create({
                data: { 
                    name: vesselName || "Usuario Público", 
                    email: normalizedEmail, 
                    role: "PUBLIC" 
                }
            });
        }

        // Create the ArrivalNotice
        const newArrivalNotice = await prisma.arrivalNotice.create({
            data: {
                id: requestId,
                distinctiveSignal,
                arrivalPort,
                etaDate: new Date(etaDate),
                protectionLevel,
                userId: user.id,
                vesselPhoto: photoPath,
            }
        });

        // Create notification for CIM
        await createNotification({
            title: "Nuevo Aviso de Arribo",
            message: `Puerto: ${arrivalPort}. ETA: ${etaDate}. Señal: ${distinctiveSignal}`,
            type: "ARRIBO",
            link: `/dashboard/arribos`
        });

        return NextResponse.json({ success: true, request: newArrivalNotice });
    } catch (error: any) {
        console.error("Aviso de Arribo Error:", error.message, error.stack);
        return NextResponse.json({ error: `Error interno del servidor: ${error.message}` }, { status: 500 });
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

        const notices = await prisma.arrivalNotice.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } }
        });

        return NextResponse.json(notices);
    } catch (error: any) {
        console.error("Error fetching arrival notices:", error.message);
        return NextResponse.json({ error: "Error al obtener los avisos" }, { status: 500 });
    }
}
