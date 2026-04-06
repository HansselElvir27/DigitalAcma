import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

const prisma = getPrismaClient();

// GET - Obtener todos los reportes marítimos (para el panel CIM)
export async function GET() {
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

// POST - Crear un nuevo reporte marítimo
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
        
        console.log("[reporte-maritimo] Received request:", { reportDate, reportType, description: description?.substring(0, 50) });
        
        // Validaciones
        if (!reportDate || !reportType || !reportType.length || !description) {
            console.log("[reporte-maritimo] Validation failed: missing required fields");
            return NextResponse.json(
                { error: "Los campos fecha, tipo de información y descripción son requeridos" },
                { status: 400 }
            );
        }
        
        // Crear el reporte
        console.log("[reporte-maritimo] Creating maritime report in database...");
        const report = await prisma.maritimeReport.create({
            data: {
                reportDate: new Date(reportDate),
                reportType: reportType,
                reportTypeOther: reportTypeOther || null,
                description: description,
                photo: photo || null,
                wantsContact: wantsContact || false,
                contactInfo: contactInfo || null,
                status: "RECEIVED"
            }
        });
        
        console.log("[reporte-maritimo] Report created successfully:", report.id);

        // Create notification for CIM
        await createNotification({
            title: "Nuevo Reporte Marítimo",
            message: `Tipo: ${Array.isArray(reportType) ? reportType.join(", ") : reportType}. Descripción: ${description.substring(0, 100)}...`,
            type: "REPORTE",
            link: `/dashboard/reporte-maritimo`
        });

        return NextResponse.json({
            success: true,
            request: report
        });
    } catch (error) {
        console.error("[reporte-maritimo] Error creating maritime report:", error);
        return NextResponse.json(
            { error: "Error al procesar el reporte marítimo", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

