import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";
import crypto from "crypto";

const prisma = getPrismaClient();

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { status, type, officialResponse, cimComment, captainComment, responseAttachments } = body;
        const userRole = (session.user as any)?.role;
        const userPortId = (session.user as any)?.portId;

        if (type === "ZARPE") {
            if (status === "PRE_APPROVED" && userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede pre-aprobar" }, { status: 403 });
            }
            if (status === "APPROVED" && userRole !== "ADMIN" && userRole !== "CAPITAN") {
                return NextResponse.json({ error: "Solo el Capitán puede autorizar" }, { status: 403 });
            }

            // Port restriction for Captain
            if (userRole === "CAPITAN") {
                if (!userPortId) {
                    return NextResponse.json({ error: "Usuario sin puerto asignado" }, { status: 403 });
                }
                const zarpe = await prisma.zarpeRequest.findUnique({
                    where: { id },
                    select: { portId: true }
                });
                if (!zarpe || zarpe.portId !== userPortId) {
                    return NextResponse.json({ error: "No autorizado para modificar solicitudes de otro puerto" }, { status: 403 });
                }
            }

            const isApproving = status === "APPROVED";
            let generatedZarpeNumber = undefined;

            if (isApproving) {
                const requestData = await prisma.zarpeRequest.findUnique({
                    where: { id },
                    include: { port: true }
                });

                if (requestData) {
                    const year = new Date().getFullYear();
                    const portCode = requestData.port.name.substring(0, 3).toUpperCase();
                    const shortId = id.substring(0, 5).toUpperCase();
                    generatedZarpeNumber = `${year}-DGMM-ZARPNAC-${portCode}-${shortId}`;
                }
            }

            await prisma.zarpeRequest.update({
                where: { id },
                data: {
                    status,
                    cimComment: cimComment || undefined,
                    captainComment: captainComment || undefined,
                    zarpeNumber: generatedZarpeNumber,
                    qrCode: isApproving ? crypto.randomBytes(16).toString("hex") : undefined,
                    captainSignature: isApproving ? `VERIFICADO Y APROBADO DIGITALMENTE POR ${(session.user as any)?.name || 'CAPITAN DE PUERTO'}` : undefined
                },
            });
        } else if (type === "INFO") {
            if (userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede responder solicitudes de información" }, { status: 403 });
            }

            await prisma.informationRequest.update({
                where: { id },
                data: {
                    status,
                    officialResponse: officialResponse || undefined,
                    responseAttachments: responseAttachments || undefined,
                    respondedAt: (officialResponse || responseAttachments) ? new Date() : undefined
                },
            });
        } else if (type === "PASE_SALIDA") {
            if (status === "PRE_APPROVED" && userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede pre-aprobar" }, { status: 403 });
            }
            if (status === "APPROVED" && userRole !== "ADMIN" && userRole !== "CAPITAN") {
                return NextResponse.json({ error: "Solo el Capitán puede autorizar" }, { status: 403 });
            }

            // Port restriction for Captain
            if (userRole === "CAPITAN") {
                if (!userPortId) {
                    return NextResponse.json({ error: "Usuario sin puerto asignado" }, { status: 403 });
                }
                const port = await prisma.port.findUnique({ where: { id: userPortId } });
                const pase = await prisma.paseSalida.findUnique({
                    where: { id },
                    select: { departurePort: true }
                });
                if (!pase || !port || pase.departurePort.trim().toLowerCase() !== port.name.trim().toLowerCase()) {
                    return NextResponse.json({ error: "No autorizado para autorizar pases de salida de otro puerto" }, { status: 403 });
                }
            }

            await prisma.paseSalida.update({
                where: { id },
                data: {
                    status,
                    cimComment: cimComment || undefined,
                    captainComment: captainComment || undefined,
                },
            });
        } else if (type === "BALIZA_DESACTIVACION") {
            if (userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede aprobar solicitudes de desactivación de baliza" }, { status: 403 });
            }

            await prisma.balizaDesactivacion.update({
                where: { id },
                data: {
                    status,
                    cimComment: cimComment || undefined,
                },
            });
        } else if (type === "AVISO_ARRIBO") {
            if (userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede aprobar avisos de arribo" }, { status: 403 });
            }

            await prisma.arrivalNotice.update({
                where: { id },
                data: { status },
            });
        } else if (type === "AVISO_ARRIBO_RECREATIVO") {
            if (userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede aprobar avisos de arribo" }, { status: 403 });
            }

            await prisma.arrivalNoticeRecreational.update({
                where: { id },
                data: { status },
            });
        }

        return NextResponse.json({ message: "Estado actualizado exitosamente" });
    } catch (error: any) {
        console.error("Status Update Error:", error.message);
        return NextResponse.json({ error: "Error al actualizar el estado de la solicitud" }, { status: 500 });
    }
}
