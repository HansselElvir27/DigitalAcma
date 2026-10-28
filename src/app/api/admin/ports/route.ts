import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Solo administradores pueden crear puertos" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, location } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "El nombre del puerto es obligatorio" }, { status: 400 });
        }

        // Generate a unique port ID based on the name
        const portId = `port_${name.trim().toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

        const port = await prisma.port.create({
            data: {
                id: portId,
                name: name.trim().toUpperCase(),
                location: location?.trim() || null,
            }
        });

        return NextResponse.json({ success: true, port });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Ya existe un puerto con ese nombre" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Solo administradores pueden eliminar puertos" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID de puerto requerido" }, { status: 400 });
    }

    try {
        await prisma.port.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
