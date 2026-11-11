import { NextResponse } from "next/server";
import { getPrismaClient, getDbPool } from "@/lib/db";

const prisma = getPrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pClient = prisma as any;

        let carnet: any = null;

        if (pClient.patronLanchaCarnet?.findFirst) {
            carnet = await pClient.patronLanchaCarnet.findFirst({
                where: {
                    OR: [
                        { id },
                        { carnetNumber: id },
                        { tituloNumero: id },
                    ]
                },
                include: {
                    port: true,
                    captain: true,
                    request: true,
                }
            });
        } else {
            const pool = getDbPool();
            const res = await pool.query(`
                SELECT c.*,
                       json_build_object('id', p.id, 'name', p.name) as port,
                       json_build_object('id', u.id, 'name', u.name) as captain
                FROM "PatronLanchaCarnet" c
                LEFT JOIN "Port" p ON p.id = c."portId"
                LEFT JOIN "User" u ON u.id = c."captainId"
                WHERE c.id = $1 OR c."carnetNumber" = $1 OR c."tituloNumero" = $1
                LIMIT 1
            `, [id]);
            carnet = res.rows[0];
        }

        if (!carnet) {
            return NextResponse.json({ error: "Carnet de Patrón de Lancha no encontrado" }, { status: 404 });
        }

        return NextResponse.json(carnet);
    } catch (error: any) {
        console.error("Error al obtener carnet de patrón:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


