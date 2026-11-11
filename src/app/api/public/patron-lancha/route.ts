import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { saveBase64ToFile } from "@/lib/storage";
import crypto from "crypto";

const prisma = getPrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            tituloNumero,
            nombres,
            apellidos,
            nacionalidad,
            identidad,
            portId,
            reciboPago,
            fotografia,
        } = body;

        // Validaciones requeridas
        if (!tituloNumero?.trim() || !nombres?.trim() || !apellidos?.trim() || !identidad?.trim() || !portId?.trim()) {
            return NextResponse.json({
                error: "Faltan campos obligatorios: Título Número, Nombres, Apellidos, Identidad y Capitanía."
            }, { status: 400 });
        }

        // Validar que exista la capitanía
        const port = await prisma.port.findUnique({ where: { id: portId } });
        if (!port) {
            return NextResponse.json({ error: "La capitanía seleccionada no existe." }, { status: 400 });
        }

        const requestId = crypto.randomUUID();

        // Guardar archivos si vienen en base64
        let reciboPagoUrl = null;
        let fotografiaUrl = null;

        if (reciboPago) {
            reciboPagoUrl = await saveBase64ToFile(reciboPago, "patron-lancha", requestId, "recibo_pago");
        }
        if (fotografia) {
            fotografiaUrl = await saveBase64ToFile(fotografia, "patron-lancha", requestId, "foto_carnet");
        }

        const patronRequest = await (prisma as any).patronLanchaRequest.create({
            data: {
                id: requestId,
                tituloNumero: tituloNumero.trim(),
                nombres: nombres.trim().toUpperCase(),
                apellidos: apellidos.trim().toUpperCase(),
                nacionalidad: (nacionalidad || "HONDUREÑA").trim().toUpperCase(),
                identidad: identidad.trim(),
                portId,
                reciboPago: reciboPagoUrl,
                fotografia: fotografiaUrl,
                status: "PENDING",
            },
            include: {
                port: true,
            }
        });

        return NextResponse.json({
            success: true,
            message: "Solicitud de Patrón de Lancha registrada exitosamente.",
            data: patronRequest,
        });

    } catch (error: any) {
        console.error("Error al registrar solicitud de patrón de lancha:", error);
        return NextResponse.json({
            error: error.message || "Error al procesar la solicitud"
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const portId = searchParams.get("portId");
        const status = searchParams.get("status");

        const where: any = {};
        if (portId) where.portId = portId;
        if (status) where.status = status;

        const requests = await (prisma as any).patronLanchaRequest.findMany({
            where,
            include: {
                port: true,
                carnet: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error("Error al obtener solicitudes de patrón de lancha:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
