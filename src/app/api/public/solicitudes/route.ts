import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { saveBase64ToFile, saveMultipleBase64 } from "@/lib/storage";
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
        const { name, email, subject, message, position, institution, country, priority, signature, attachments } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        const requestId = crypto.randomUUID();

        // Save files to filesystem safely
        const signaturePath = await saveBase64ToFile(signature, 'info-requests', requestId, 'signature.png');
        const attachmentsPaths = await saveMultipleBase64(attachments, 'info-requests', requestId);

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find or create public user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            user = await prisma.user.create({
                data: { name: name.trim(), email: normalizedEmail, role: "PUBLIC" }
            });
        } else if (user.role === "PUBLIC" && name) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { name: name.trim() }
            });
        }

        // Create the request with all fields
        const newRequest = await prisma.informationRequest.create({
            data: {
                id: requestId,
                subject: subject.trim(),
                message: message.trim(),
                userId: user.id,
                position: position ? position.trim() : null,
                institution: institution ? institution.trim() : null,
                country: country ? country.trim() : null,
                priority: priority ? priority.trim() : null,
                signature: signaturePath,
                attachments: attachmentsPaths,
            }
        });

        // Create notification for CIM users
        await createNotification({
            title: "Nueva Solicitud de Información",
            message: `De: ${name} (${normalizedEmail}). Asunto: ${subject}`,
            type: "INFO_REQUEST",
            link: `/dashboard/info`
        });

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error: any) {
        console.error("Public Form Error:", error.message);
        return NextResponse.json({ error: "Error al procesar la solicitud de información" }, { status: 500 });
    }
}
