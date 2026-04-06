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
        
        console.log("Pase de Salida request received:", JSON.stringify(body, null, 2));
        
        const {
            vesselName,
            registrationNum,
            departureDate,
            departureTime,
            departurePort,
            destination,
            operatorName,
            crewList,
            passengerList,
            guideName,
            activityType,
            email,
            signature
        } = body;

        if (!vesselName || !registrationNum || !departureDate || !departureTime || 
            !departurePort || !destination || !operatorName || !activityType || !email || !signature) {
            return NextResponse.json({ error: "Faltan datos requeridos incluyendo la firma" }, { status: 400 });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find or create public user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            user = await prisma.user.create({
                data: { name: operatorName, email: normalizedEmail, role: "PUBLIC" }
            });
        }

        // Combine date and time
        const fullDateTime = new Date(`${departureDate}T${departureTime}:00`);

        // Create the PaseSalida request
        const newPaseSalida = await prisma.paseSalida.create({
            data: {
                vesselName,
                registrationNum,
                departureDate: fullDateTime,
                departureTime,
                departurePort,
                destination,
                operatorName,
                crewList: crewList || null,
                passengerList: passengerList || null,
                guideName: guideName || null,
                activityType,
                email,
                signature,
                userId: user.id,
            }
        });

        // Create notification for CIM
        await createNotification({
            title: "Nuevo Pase de Salida",
            message: `Embarcación: ${vesselName}. Operador: ${operatorName}. Puerto: ${departurePort}`,
            type: "PASE_SALIDA",
            link: `/dashboard/pase-salida`
        });

        return NextResponse.json({ success: true, request: newPaseSalida });
    } catch (error: any) {
        console.error("Pase de Salida Error:", error.message, error.stack);
        return NextResponse.json({ error: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
}

