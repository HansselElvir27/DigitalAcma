import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = getPrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || ((session.user as any).role !== "CAPITAN" && (session.user as any).role !== "ADMIN")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { citaDate, observation, citaNumber } = body;

        // Port restriction for Captains
        if ((session.user as any).role === "CAPITAN") {
            const userPortId = (session.user as any).portId;
            if (!userPortId) {
                return NextResponse.json({ error: "No tiene puerto asignado" }, { status: 403 });
            }

            const existingRequest = await prisma.embarcacionInscripcionRequest.findUnique({
                where: { id },
                select: { portId: true }
            });

            if (!existingRequest || existingRequest.portId !== userPortId) {
                return NextResponse.json({ error: "No autorizado para aprobar trámites de otra capitanía" }, { status: 403 });
            }
        }

        const updatedRequest = await prisma.embarcacionInscripcionRequest.update({
            where: { id },
            data: {
                status: "APPROVED",
                citaDate: citaDate ? new Date(citaDate) : new Date(),
                observation: observation || null,
                citaNumber: citaNumber || null,
                userId: (session.user as any).id
            }
        });

        return NextResponse.json({ success: true, request: updatedRequest });
    } catch (error: any) {
        console.error("Error al aprobar inscripción:", error.message);
        return NextResponse.json({ error: "Error al procesar la aprobación" }, { status: 500 });
    }
}
