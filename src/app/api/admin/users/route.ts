import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const prisma = getPrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "CIM")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                portId: true,
                createdAt: true,
                updatedAt: true,
                port: true,
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
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

        if (typeof password !== "string" || password.length < 8) {
            return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (existingUser) {
            return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
        }

        const hashedPassword = hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name: name ? name.trim() : null,
                role,
                portId: portId || null
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                portId: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 });
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

    // Prevent deleting one's own admin account
    if (id === (session.user as any).id) {
        return NextResponse.json({ error: "No puedes eliminar tu propia cuenta de administrador" }, { status: 400 });
    }

    try {
        await prisma.user.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 });
    }
}
