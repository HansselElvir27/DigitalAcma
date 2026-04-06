import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CIM") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            solicitudesHoyZarpe,
            zarpesPendientes,
            solicitudesHoyPaseSalida,
            paseSalidaPendientes,
            avisosArribo,
            balizaPendientes,
        ] = await Promise.all([
            prisma.zarpeRequest.count({ where: { createdAt: { gte: today } } }),
            prisma.zarpeRequest.count({ where: { status: "PENDING" } }),
            prisma.paseSalida.count({ where: { createdAt: { gte: today } } }),
            prisma.paseSalida.count({ where: { status: "PENDING" } }),
            prisma.arrivalNotice.count(),
            prisma.balizaDesactivacion.count({ where: { status: "PENDING" } }),
        ]);

        return NextResponse.json({
            solicitudesHoy: solicitudesHoyZarpe + solicitudesHoyPaseSalida,
            zarpesPendientes,
            paseSalidaPendientes,
            avisosArribo,
            balizaPendientes,
            alertasActivas: 2, // Static for simulation
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
