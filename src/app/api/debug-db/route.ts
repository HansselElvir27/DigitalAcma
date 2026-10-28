import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";

export async function GET() {
    // Only available in development or for authenticated ADMIN
    if (process.env.NODE_ENV === "production") {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Not Found", { status: 404 });
        }
    }

    try {
        const prisma = getPrismaClient();
        const userCount = await prisma.user.count();
        return NextResponse.json({ success: true, userCount });
    } catch (error: any) {
        console.error("Debug DB Error:", error.message);
        return NextResponse.json({
            success: false,
            error: "Database check failed"
        }, { status: 500 });
    }
}
