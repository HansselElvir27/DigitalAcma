import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

const prisma = getPrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const vessel = await prisma.vesselRegistration.findUnique({
      where: { id },
      include: { port: true }
    });

    if (!vessel) {
      return NextResponse.json({ error: "Embarcación no encontrada" }, { status: 404 });
    }

    // Create a new inscription request of type RENEWAL
    const renewalRequest = await prisma.embarcacionInscripcionRequest.create({
      data: {
        fullName: vessel.ownerName || "Propietario de " + vessel.vesselName,
        phone: vessel.phone || "",
        email: vessel.email || "",
        portId: vessel.portId,
        type: "RENEWAL",
        renewalVesselId: vessel.id,
        status: "PENDING",
        userId: vessel.captainId // Or the user who owns it
      }
    });

    // Create notification for CIM and Capitanía
    await createNotification({
        title: "Nueva Renovación de Embarcación",
        message: `Embarcación: ${vessel.vesselName}. Puerto: ${vessel.port.name}`,
        type: "INSPECTION",
        link: `/dashboard/inscripcion-embarcaciones`,
        portId: vessel.portId
    });

    return NextResponse.json({ success: true, request: renewalRequest });
  } catch (error: any) {
    console.error("Error initiating renewal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
