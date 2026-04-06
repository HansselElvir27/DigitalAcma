import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CAPITAN" || !session.user.portId) {
        return NextResponse.json({ error: "No autorizado o sin puerto asignado" }, { status: 401 });
    }

    try {
        const portId = session.user.portId;

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const [zarpesPendientes, pasesSalida, inscripciones, expiringVessels] = await Promise.all([
            prisma.zarpeRequest.findMany({
                where: { portId, status: "PENDING" },
                orderBy: { createdAt: "desc" },
            }),
            prisma.departurePass.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
            }),
            prisma.embarcacionInscripcionRequest.findMany({
                where: { portId, status: "PENDING" },
                orderBy: { createdAt: "desc" },
                include: { port: { select: { name: true } } }
            }),
            prisma.vesselRegistration.findMany({
                where: {
                    portId,
                    expirationDate: {
                        lte: thirtyDaysFromNow,
                        gte: new Date()
                    }
                },
                orderBy: { expirationDate: "asc" }
            })
        ]);

        return NextResponse.json({
            zarpesPendientes: zarpesPendientes.map((z: any) => ({
                id: z.id,
                ship: z.vesselName,
                status: "LISTO PARA FIRMA", // Simplified status for local capitan
                time: `Entrada: ${z.createdAt.toLocaleTimeString()}`
            })),
            pasesSalida: pasesSalida,
            inscripcionesPendientes: inscripciones.map((i: any) => ({
                id: i.id,
                applicant: i.fullName,
                phone: i.phone,
                email: i.email,
                time: `Recibido: ${i.createdAt.toLocaleDateString()}`
            })),
            vesselsExpiring: expiringVessels.map((v: any) => ({
                id: v.id,
                name: v.vesselName,
                regNum: v.registrationNumber,
                expirationDate: v.expirationDate
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
