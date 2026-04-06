import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import fs from "fs";

const prisma = getPrismaClient();

// Increase max body size to handle base64 file attachments
export const config = {
    api: {
        bodyParser: {
            sizeLimit: "20mb",
        },
    },
};

const logFile = "c:\\Users\\ACMACIM\\Desktop\\Digitalacma\\solicitudes-log.txt";
const log = (msg: string) => {
    try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { }
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message, position, institution, country, priority, signature, attachments } = body;

        log(`New request from: ${email}, priority: ${priority}, attachments count: ${Array.isArray(attachments) ? attachments.length : 0}`);

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find or create public user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            log(`Creating new user: ${normalizedEmail}`);
            user = await prisma.user.create({
                data: { name, email: normalizedEmail, role: "PUBLIC" }
            });
        }

        log(`User ID: ${user.id}, creating infoRequest...`);

        // Create the request with all fields
        const newRequest = await prisma.informationRequest.create({
            data: {
                subject,
                message,
                userId: user.id,
                position: position || null,
                institution: institution || null,
                country: country || null,
                priority: priority || null,
                signature: signature || null,
                attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null,
            }
        });

        log(`Created request ID: ${newRequest.id}`);

        // Create notification for CIM users
        await createNotification({
            title: "Nueva Solicitud de Información",
            message: `De: ${name} (${email}). Asunto: ${subject}`,
            type: "INFO_REQUEST",
            link: `/dashboard/info`
        });

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error: any) {
        log(`ERROR: ${error.message}\nStack: ${error.stack}`);
        console.error("Public Form Error:", error.message, error.stack);
        return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
    }
}
