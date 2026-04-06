import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = getPrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CAPITAN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { citaDate, observation, citaNumber } = body;

        const updatedRequest = await prisma.embarcacionInscripcionRequest.update({
            where: { id },
            data: {
                status: "APPROVED",
                citaDate: new Date(citaDate),
                observation,
                citaNumber,
                userId: session.user.id // Keep track of the assigning capitan
            }
        });

        return NextResponse.json({ success: true, request: updatedRequest });
    } catch (error: any) {
        console.error("Error al aprobar inscripción:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
