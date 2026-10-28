import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    // Only available in development or for authenticated ADMIN
    if (process.env.NODE_ENV === "production") {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Not Found", { status: 404 });
        }
    }

    return NextResponse.json({
        status: "ok",
        environment: process.env.NODE_ENV || "development"
    });
}
