import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = getPrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const vessel = await prisma.vesselRegistration.findUnique({
      where: { id },
      include: { 
          port: true,
          captain: true,
          history: {
              orderBy: { changedAt: 'desc' }
          }
      }
    });

    if (!vessel) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(vessel);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
