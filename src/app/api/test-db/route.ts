import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

export async function GET() {
  const prisma = getPrismaClient();
  const models = Object.keys(prisma).filter(k => !k.startsWith('_'));
  const hasNotification = !!(prisma as any).notification;
  
  return NextResponse.json({
    models,
    hasNotification
  });
}
