import { getPrismaClient } from "./db";

const prisma = getPrismaClient();

export type NotificationType = 
  | "INFO_REQUEST" 
  | "INSPECTION" 
  | "ZARPE" 
  | "PASE_SALIDA" 
  | "ARRIBO" 
  | "REPORTE" 
  | "BALIZA";

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  portId?: string;
}

/**
 * Creates individual notification records for all relevant users (CIM and specific CAPITANs).
 */
export async function createNotification({ title, message, type, link, portId }: CreateNotificationParams) {
  try {
    // Find all CIM users
    const cimUsers = await prisma.user.findMany({
      where: { role: "CIM" },
      select: { id: true }
    });

    // Find CAPITAN users for the specific port (if provided)
    let capitanUsers: { id: string }[] = [];
    if (portId) {
      capitanUsers = await prisma.user.findMany({
        where: { 
          role: "CAPITAN",
          portId: portId
        },
        select: { id: true }
      });
    }

    // Combine users and remove duplicates
    const recipientIds = Array.from(new Set([
      ...cimUsers.map(u => u.id),
      ...capitanUsers.map(u => u.id)
    ]));

    if (recipientIds.length === 0) return;

    // Create notifications for all recipients
    await prisma.notification.createMany({
      data: recipientIds.map(userId => ({
        title,
        message,
        type,
        link,
        userId,
        portId,
        read: false
      }))
    });

    console.log(`[NOTIFICATIONS] Created ${recipientIds.length} notifications for type ${type}`);
  } catch (error) {
    console.error("[NOTIFICATIONS] Error creating notifications:", error);
  }
}

/**
 * Fetches unread notifications for a specific user.
 */
export async function getUnreadNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { 
      userId,
      read: false
    },
    orderBy: { createdAt: "desc" }
  });
}
