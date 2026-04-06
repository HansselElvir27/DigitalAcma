import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

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
        
        console.log("Aviso de Arribo request received:", JSON.stringify(body, null, 2));
        
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
                distinctiveSignal,
                arrivalPort,
                etaDate: new Date(etaDate),
                protectionLevel,
                userId: user.id,
                vesselPhoto: vesselPhoto || null,
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

// GET endpoint to list all arrival notices for admin/CIM
export async function GET(request: Request) {
    try {
        const notices = await prisma.arrivalNotice.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } }
        });

        return NextResponse.json(notices);
    } catch (error: any) {
        console.error("Error fetching arrival notices:", error.message);
        return NextResponse.json({ error: "Error al obtener los avisos" }, { status: 500 });
    }
}

