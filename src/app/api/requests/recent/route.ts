import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const [zarpes, info, paseSalidas, balizas] = await Promise.all([
            prisma.zarpeRequest.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { port: true },
            }),
            prisma.informationRequest.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
            }),
            prisma.paseSalida.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
            }),
            prisma.balizaDesactivacion.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const combined = [
            ...zarpes.map((z: any) => ({
                id: z.id,
                type: "Zarpe Nacional",
                subject: z.vesselName,
                status: z.status,
                color: z.status === "PENDING" ? "text-amber-500" : z.status === "APPROVED" ? "text-green-500" : "text-blue-500",
                createdAt: z.createdAt,
            })),
            ...info.map((i: any) => ({
                id: i.id,
                type: "Intercambio Info",
                subject: i.subject,
                status: i.status,
                color: i.status === "PENDING" ? "text-amber-500" : i.status === "APPROVED" ? "text-green-500" : "text-blue-500",
                createdAt: i.createdAt,
            })),
            ...paseSalidas.map((p: any) => ({
                id: p.id,
                type: "Pase de Salida",
                subject: `${p.vesselName} - ${p.activityType}`,
                status: p.status,
                color: p.status === "PENDING" ? "text-amber-500" : p.status === "APPROVED" ? "text-green-500" : "text-blue-500",
                createdAt: p.createdAt,
            })),
            ...balizas.map((b: any) => ({
                id: b.id,
                type: "Desactivación Baliza",
                subject: `${b.nombreEmbarcacion} - ${b.condicion}`,
                status: b.status,
                color: b.status === "PENDING" ? "text-amber-500" : b.status === "APPROVED" ? "text-green-500" : "text-blue-500",
                createdAt: b.createdAt,
            })),
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return NextResponse.json(combined.slice(0, 10));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
