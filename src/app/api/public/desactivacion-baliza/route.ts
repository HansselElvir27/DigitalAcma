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
        
        console.log("Desactivación de Baliza request received");
        
        const {
            fechaHora,
            nombreSolicitante,
            condicion,
            correo,
            nombreEmbarcacion,
            numeroRegistro,
            capitaniaPuerto,
            motivo,
            signature
        } = body;

        if (!fechaHora || !nombreSolicitante || !condicion || !correo || 
            !nombreEmbarcacion || !numeroRegistro || !capitaniaPuerto || !motivo || !signature) {
            return NextResponse.json({ error: "Faltan datos requeridos incluyendo la firma" }, { status: 400 });
        }

        const requestId = crypto.randomUUID();

        // Save signature to filesystem
        const signaturePath = await saveBase64ToFile(signature, 'baliza-desactivacion', requestId, 'signature.png');

        // Normalize email
        const normalizedEmail = correo.trim().toLowerCase();

        // Find or create public user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            user = await prisma.user.create({
                data: { name: nombreSolicitante, email: normalizedEmail, role: "PUBLIC" }
            });
        }

        // Create the BalizaDesactivacion request
        const newBaliza = await prisma.balizaDesactivacion.create({
            data: {
                id: requestId,
                fechaHora: new Date(fechaHora),
                nombreSolicitante,
                condicion,
                correo,
                nombreEmbarcacion,
                numeroRegistro,
                capitaniaPuerto,
                motivo,
                signature: signaturePath,
                userId: user.id,
            }
        });

        // Create notification for CIM
        await createNotification({
            title: "Nueva Desactivación de Baliza",
            message: `Embarcación: ${nombreEmbarcacion}. Solicitante: ${nombreSolicitante}. Motivo: ${motivo.substring(0, 50)}...`,
            type: "BALIZA",
            link: `/dashboard/desactivacion-baliza`
        });

        return NextResponse.json({ success: true, request: newBaliza });
    } catch (error: any) {
        console.error("Desactivación Baliza Error:", error.message, error.stack);
        return NextResponse.json({ error: `Error interno del servidor: ${error.message}` }, { status: 500 });
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
        let where: any = {};
        if (userRole === "CAPITAN" && userPortId) {
            const port = await prisma.port.findUnique({ where: { id: userPortId } });
            if (port) {
                where.capitaniaPuerto = port.name;
            }
        }

        const solicitudes = await prisma.balizaDesactivacion.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });
        
        return NextResponse.json(solicitudes);
    } catch (error: any) {
        console.error("Error fetching baliza requests:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
