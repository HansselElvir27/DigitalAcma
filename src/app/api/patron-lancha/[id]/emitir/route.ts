import { NextResponse } from "next/server";
import { getPrismaClient, getDbPool } from "@/lib/db";
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

        const pool = getDbPool();
        const pClient = prisma as any;

        let patronReq: any = null;

        if (pClient.patronLanchaRequest?.findUnique) {
            patronReq = await pClient.patronLanchaRequest.findUnique({
                where: { id },
                include: { port: true, carnet: true }
            });
        } else {
            const res = await pool.query(`
                SELECT r.*, 
                       json_build_object('id', p.id, 'name', p.name) as port,
                       (SELECT row_to_json(c) FROM "PatronLanchaCarnet" c WHERE c."requestId" = r.id) as carnet
                FROM "PatronLanchaRequest" r
                LEFT JOIN "Port" p ON p.id = r."portId"
                WHERE r.id = $1
            `, [id]);
            patronReq = res.rows[0];
        }

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

        let carnet: any = null;

        if (pClient.patronLanchaCarnet?.create) {
            carnet = await pClient.patronLanchaCarnet.create({
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

            await pClient.patronLanchaRequest.update({
                where: { id: patronReq.id },
                data: { status: "APPROVED" }
            });
        } else {
            const insertCarnetSql = `
                INSERT INTO "PatronLanchaCarnet" (
                    "id", "carnetNumber", "tituloNumero", "nombres", "apellidos", "nacionalidad",
                    "identidad", "fotografia", "capacidadRestan", "puertoRegistro", "emision",
                    "expiracion", "status", "portId", "captainId", "requestId", "captainSignature",
                    "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'VIGENTE', $13, $14, $15, $16, $11, $11)
                RETURNING *;
            `;
            const carnetRes = await pool.query(insertCarnetSql, [
                carnetId,
                patronReq.tituloNumero,
                patronReq.tituloNumero,
                patronReq.nombres,
                patronReq.apellidos,
                patronReq.nacionalidad || "HONDUREÑA",
                patronReq.identidad,
                patronReq.fotografia,
                capacidadRestan || "5 TONELADAS",
                finalPuertoRegistro,
                emision,
                expiracion,
                patronReq.portId,
                user.id || null,
                patronReq.id,
                captainSignature || null,
            ]);

            await pool.query(`UPDATE "PatronLanchaRequest" SET "status" = 'APPROVED' WHERE id = $1`, [patronReq.id]);

            carnet = {
                ...carnetRes.rows[0],
                port: patronReq.port,
                captain: { name: user.name || "Capitán Autorizado" },
            };
        }

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


