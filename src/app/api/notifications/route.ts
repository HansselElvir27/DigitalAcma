import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

/**
 * GET - Fetch all unread notifications for the current user
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("[API_NOTIFICATIONS_GET] Error:", error.message);
    return NextResponse.json({ error: "Error al consultar notificaciones" }, { status: 500 });
  }
}

/**
 * PATCH - Mark all notifications as read for the current user
 */
export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_NOTIFICATIONS_PATCH] Error:", error.message);
    return NextResponse.json({ error: "Error al actualizar notificaciones" }, { status: 500 });
  }
}

/**
 * DELETE - Mark a specific notification as read for the current user (IDOR protected)
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID de notificación requerido" }, { status: 400 });
  }

  try {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Notificación no encontrada o no autorizada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_NOTIFICATIONS_DELETE] Error:", error.message);
    return NextResponse.json({ error: "Error al actualizar la notificación" }, { status: 500 });
  }
}
