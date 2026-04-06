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
        
        console.log("Aviso de Arribo Recreativo request received:", JSON.stringify(body, null, 2));
        
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
                vesselPhoto: vesselPhoto || null,
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

// GET endpoint to list all recreational arrival notices for admin/CIM
export async function GET(request: Request) {
    try {
        const notices = await prisma.arrivalNoticeRecreational.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } }
        });

        return NextResponse.json(notices);
    } catch (error: any) {
        console.error("Error fetching recreational arrival notices:", error.message);
        return NextResponse.json({ error: "Error al obtener los avisos" }, { status: 500 });
    }
}

