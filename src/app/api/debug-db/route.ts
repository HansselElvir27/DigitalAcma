import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

export async function GET() {
    try {
        console.log("Debug DB: Attempting query...");
        const userCount = await prisma.user.count();
        return NextResponse.json({ success: true, userCount });
    } catch (error: any) {
        console.error("Debug DB Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            envPresent: !!process.env.DATABASE_URL
        }, { status: 500 });
    }
}
