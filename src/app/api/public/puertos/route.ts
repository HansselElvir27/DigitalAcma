import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ports = await prisma.port.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true
      }
    });
    console.log(`Capitanías loaded: ${ports.length}`);
    return NextResponse.json(ports);
  } catch (error: any) {
    console.error('Error loading puertos:', error);
    console.log('Returning empty ports list to avoid client error');
    return NextResponse.json([]);
  }
}
