import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

const prisma = getPrismaClient();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;

        // Solo CAPITAN o ADMIN pueden emitir
        if (!user || (user.role !== "CAPITAN" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "No autorizado para emitir Patrón de Lancha" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const {
            capacidadRestan = "5 TONELADAS",
            puertoRegistro,
            captainSignature,
        } = body;

        // Buscar la solicitud
        const patronReq = await (prisma as any).patronLanchaRequest.findUnique({
            where: { id },
            include: { port: true, carnet: true }
        });

        if (!patronReq) {
            return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
        }

        if (patronReq.carnet) {
            return NextResponse.json({
                error: "Esta solicitud ya tiene un Patrón de Lancha emitido",
                carnet: patronReq.carnet
            }, { status: 400 });
        }

        const emision = new Date();
        const expiracion = new Date();
        expiracion.setFullYear(emision.getFullYear() + 2); // Expiración: 2 años después

        const carnetId = crypto.randomUUID();
        const finalPuertoRegistro = (puertoRegistro || patronReq.port?.name || "TELA").trim().toUpperCase();

        const carnet = await (prisma as any).patronLanchaCarnet.create({
            data: {
                id: carnetId,
                carnetNumber: patronReq.tituloNumero,
                tituloNumero: patronReq.tituloNumero,
                nombres: patronReq.nombres,
                apellidos: patronReq.apellidos,
                nacionalidad: patronReq.nacionalidad || "HONDUREÑA",
                identidad: patronReq.identidad,
                fotografia: patronReq.fotografia,
                capacidadRestan: capacidadRestan || "5 TONELADAS",
                puertoRegistro: finalPuertoRegistro,
                emision,
                expiracion,
                status: "VIGENTE",
                portId: patronReq.portId,
                captainId: user.id || null,
                requestId: patronReq.id,
                captainSignature: captainSignature || null,
            },
            include: {
                port: true,
                captain: true,
            }
        });

        // Actualizar estado de la solicitud a APPROVED
        await (prisma as any).patronLanchaRequest.update({
            where: { id: patronReq.id },
            data: { status: "APPROVED" }
        });

        return NextResponse.json({
            success: true,
            message: "Patrón de Lancha emitido exitosamente",
            carnet,
        });

    } catch (error: any) {
        console.error("Error al emitir patrón de lancha:", error);
        return NextResponse.json({ error: error.message || "Error al emitir carnet" }, { status: 500 });
    }
}
