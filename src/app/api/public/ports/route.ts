import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const ports = await prisma.port.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(ports);
    } catch (error) {
        return NextResponse.json({ error: "Error al obtener la lista de puertos" }, { status: 500 });
    }
}
