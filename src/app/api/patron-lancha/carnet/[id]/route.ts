import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Buscar por id del carnet o por número de carnet/título
        let carnet = await (prisma as any).patronLanchaCarnet.findFirst({
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

        if (!carnet) {
            return NextResponse.json({ error: "Carnet de Patrón de Lancha no encontrado" }, { status: 404 });
        }

        return NextResponse.json(carnet);
    } catch (error: any) {
        console.error("Error al obtener carnet de patrón:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
