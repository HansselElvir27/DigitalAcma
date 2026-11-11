import { NextResponse } from "next/server";
import { getPrismaClient, getDbPool } from "@/lib/db";
import { saveBase64ToFile } from "@/lib/storage";
import crypto from "crypto";

const prisma = getPrismaClient();

// Asegurar que las tablas existan directamente en PostgreSQL (sin depender exclusivamente de prisma db push)
async function ensurePatronTables() {
    const pool = getDbPool();
    if (!pool) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "PatronLanchaRequest" (
            "id" TEXT PRIMARY KEY,
            "tituloNumero" TEXT NOT NULL,
            "nombres" TEXT NOT NULL,
            "apellidos" TEXT NOT NULL,
            "nacionalidad" TEXT NOT NULL DEFAULT 'HONDUREÑA',
            "identidad" TEXT NOT NULL,
            "reciboPago" TEXT,
            "fotografia" TEXT,
            "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
            "observation" TEXT,
            "portId" TEXT NOT NULL,
            "userId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PatronLanchaRequest_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "PatronLanchaCarnet" (
            "id" TEXT PRIMARY KEY,
            "carnetNumber" TEXT NOT NULL UNIQUE,
            "tituloNumero" TEXT NOT NULL,
            "nombres" TEXT NOT NULL,
            "apellidos" TEXT NOT NULL,
            "nacionalidad" TEXT NOT NULL DEFAULT 'HONDUREÑA',
            "identidad" TEXT NOT NULL,
            "fotografia" TEXT,
            "capacidadRestan" TEXT NOT NULL DEFAULT '5 TONELADAS',
            "puertoRegistro" TEXT NOT NULL,
            "emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "expiracion" TIMESTAMP(3) NOT NULL,
            "leyenda" TEXT NOT NULL DEFAULT 'El portador de éste carnet está autorizado por la Dirección General de la Marina Mercante a gobernar embarcaciones a motor y/o vela con una Capacida no mayor de la especificada en la parte posterior del mismo, en las zonas comprendidas entre la costa nacional y una línea paralela a la misma trazada a 12 millas náuticas así como la navegación Interinsular. Esto en virtud de lo dispuesto en el acuerdo de DGMM 002 del año 2000.',
            "status" TEXT NOT NULL DEFAULT 'VIGENTE',
            "captainSignature" TEXT,
            "qrCode" TEXT,
            "portId" TEXT NOT NULL,
            "captainId" TEXT,
            "requestId" TEXT UNIQUE,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PatronLanchaCarnet_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "PatronLanchaCarnet_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PatronLanchaRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE
        );
    `);
}

export async function POST(request: Request) {
    try {
        await ensurePatronTables();

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

        const pClient = prisma as any;
        let patronRequest: any = null;

        // Si el cliente generado de Prisma tiene el modelo cargado
        if (pClient.patronLanchaRequest?.create) {
            patronRequest = await pClient.patronLanchaRequest.create({
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
        } else {
            // Fallback con SQL directo por si el cliente prisma aún no fue regenerado en el servidor
            const pool = getDbPool();
            const now = new Date();
            const insertQuery = `
                INSERT INTO "PatronLanchaRequest" (
                    "id", "tituloNumero", "nombres", "apellidos", "nacionalidad", 
                    "identidad", "portId", "reciboPago", "fotografia", "status", "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', $10, $10)
                RETURNING *;
            `;
            const result = await pool.query(insertQuery, [
                requestId,
                tituloNumero.trim(),
                nombres.trim().toUpperCase(),
                apellidos.trim().toUpperCase(),
                (nacionalidad || "HONDUREÑA").trim().toUpperCase(),
                identidad.trim(),
                portId,
                reciboPagoUrl,
                fotografiaUrl,
                now
            ]);

            patronRequest = {
                ...result.rows[0],
                port,
            };
        }

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
        await ensurePatronTables();

        const { searchParams } = new URL(request.url);
        const portId = searchParams.get("portId");
        const status = searchParams.get("status");

        const pClient = prisma as any;
        if (pClient.patronLanchaRequest?.findMany) {
            const where: any = {};
            if (portId) where.portId = portId;
            if (status) where.status = status;

            const requests = await pClient.patronLanchaRequest.findMany({
                where,
                include: {
                    port: true,
                    carnet: true,
                },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(requests);
        } else {
            const pool = getDbPool();
            let query = `
                SELECT r.*, 
                       json_build_object('id', p.id, 'name', p.name) as port,
                       (SELECT row_to_json(c) FROM "PatronLanchaCarnet" c WHERE c."requestId" = r.id) as carnet
                FROM "PatronLanchaRequest" r
                LEFT JOIN "Port" p ON p.id = r."portId"
                WHERE 1=1
            `;
            const params: any[] = [];
            if (portId) {
                params.push(portId);
                query += ` AND r."portId" = $${params.length}`;
            }
            if (status) {
                params.push(status);
                query += ` AND r."status" = $${params.length}`;
            }
            query += ` ORDER BY r."createdAt" DESC`;

            const res = await pool.query(query, params);
            return NextResponse.json(res.rows);
        }
    } catch (error: any) {
        console.error("Error al obtener solicitudes de patrón de lancha:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


