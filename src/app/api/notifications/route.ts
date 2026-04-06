import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

// Debugging
console.log("[DEBUG_NOTIFICATIONS] Models:", Object.keys(prisma).filter(k => !k.startsWith('_')));
console.log("[DEBUG_NOTIFICATIONS] Notification model exists:", !!(prisma as any).notification);

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
    console.error("[API_NOTIFICATIONS_GET] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    console.error("[API_NOTIFICATIONS_PATCH] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE - Mark a specific notification as read (using query param id)
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID de notificación requerido" }, { status: 400 });
  }

  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_NOTIFICATIONS_DELETE] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
