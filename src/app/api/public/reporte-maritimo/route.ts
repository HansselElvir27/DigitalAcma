import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { saveBase64ToFile } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

const prisma = getPrismaClient();

// GET - Obtener reportes marítimos (restringido a CIM y ADMIN)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || ((session.user as any).role !== "CIM" && (session.user as any).role !== "ADMIN")) {
        return NextResponse.json({ error: "No autorizado para consultar reportes marítimos" }, { status: 401 });
    }

    try {
        const reports = await prisma.maritimeReport.findMany({
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        });
        
        return NextResponse.json(reports);
    } catch (error) {
        console.error("Error fetching maritime reports:", error);
        return NextResponse.json(
            { error: "Error al obtener los reportes marítimos" },
            { status: 500 }
        );
    }
}

// POST - Crear un nuevo reporte marítimo (público)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const {
            reportDate,
            reportType,
            reportTypeOther,
            description,
            photo,
            wantsContact,
            contactInfo
        } = body;
        
        // Validaciones
        if (!reportDate || !reportType || !reportType.length || !description) {
            return NextResponse.json(
                { error: "Los campos fecha, tipo de información y descripción son requeridos" },
                { status: 400 }
            );
        }

        const requestId = crypto.randomUUID();

        // Save photo to filesystem safely
        const photoPath = await saveBase64ToFile(photo, 'maritime-reports', requestId, 'report_photo.jpg');
        
        // Crear el reporte
        const report = await prisma.maritimeReport.create({
            data: {
                id: requestId,
                reportDate: new Date(reportDate),
                reportType: reportType,
                reportTypeOther: reportTypeOther || null,
                description: description.trim(),
                photo: photoPath,
                wantsContact: !!wantsContact,
                contactInfo: wantsContact && contactInfo ? contactInfo.trim() : null,
                status: "RECEIVED"
            }
        });

        // Create notification for CIM
        await createNotification({
            title: "Nuevo Reporte Marítimo",
            message: `Tipo: ${Array.isArray(reportType) ? reportType.join(", ") : reportType}. Descripción: ${description.substring(0, 100)}...`,
            type: "REPORTE",
            link: `/dashboard/reporte-maritimo`
        });

        return NextResponse.json({
            success: true,
            request: {
                id: report.id,
                status: report.status,
                createdAt: report.createdAt
            }
        });
    } catch (error: any) {
        console.error("[reporte-maritimo] Error creating maritime report:", error);
        return NextResponse.json(
            { error: "Error al procesar el reporte marítimo" },
            { status: 500 }
        );
    }
}
