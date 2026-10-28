import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

// GET /api/vessels/check-name?name=XXX
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name?.trim()) {
    return NextResponse.json({ exists: false });
  }

  const existing = await prisma.vesselRegistration.findFirst({
    where: { vesselName: { equals: name.trim(), mode: "insensitive" } },
    select: { id: true, registrationNumber: true }
  });

  return NextResponse.json({ exists: !!existing, registration: existing ?? null });
}
