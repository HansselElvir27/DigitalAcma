import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "CIM")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            include: { port: true },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Solo administradores pueden crear usuarios" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, password, name, role, portId } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password, // Note: In a real app, hash this password. This codebase uses plain text in seed.ts too.
                name,
                role,
                portId: portId || null
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Solo administradores pueden eliminar usuarios" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    try {
        await prisma.user.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
