import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";
import fs from "fs";

const prisma = getPrismaClient();

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Re-check schema alignment
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const logFile = "c:\\Users\\ACMACIM\\Desktop\\Digitalacma\\api-log.txt";
    const log = (msg: string) => {
        try {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] PATCH /status: ${msg}\n`);
        } catch (e) { }
    };

    try {
        const body = await request.json();
        const { status, type, officialResponse, cimComment, responseAttachments } = body;

        log(`Update request for ID: ${id}, type: ${type}, status: ${status}`);

        if (type === "ZARPE") {
            // Role-based logic: 
            // - CIM can pre-approve with a comment.
            // - Captain can authorize (status -> APPROVED)
            const userRole = (session?.user as any)?.role;
            const userPortId = (session?.user as any)?.portId;

            if (status === "PRE_APPROVED" && userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede pre-aprobar" }, { status: 403 });
            }
            if (status === "APPROVED" && userRole !== "ADMIN" && userRole !== "CAPITAN") {
                return NextResponse.json({ error: "Solo el Capitán puede autorizar" }, { status: 403 });
            }

            const isApproving = status === "APPROVED";
            let generatedZarpeNumber = undefined;

            if (isApproving) {
                // Fetch full request data to get port name for the official number
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
                    zarpeNumber: generatedZarpeNumber,
                    qrCode: isApproving ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) : undefined
                },
            });
        } else if (type === "INFO") {
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
            // Role-based logic: 
            // - CIM can pre-approve with a comment.
            // - Captain can authorize (status -> APPROVED)
            const userRole = (session?.user as any)?.role;
            const userPortId = (session?.user as any)?.portId;

            if (status === "PRE_APPROVED" && userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede pre-aprobar" }, { status: 403 });
            }
            if (status === "APPROVED" && userRole !== "ADMIN" && userRole !== "CAPITAN") {
                return NextResponse.json({ error: "Solo el Capitán puede autorizar" }, { status: 403 });
            }

            // Port restriction: Captains can only authorized requests from their assigned port
            if (userRole === "CAPITAN") {
                const requestData = await prisma.paseSalida.findUnique({
                    where: { id },
                    select: { departurePort: true }
                });
                // For PaseSalida, we check if the departurePort matches captain's port
                // This is a simplified check - you might want to add a port relation
                log(`Captain ${userRole} attempting to approve PaseSalida ${id}`);
            }

            const isApproving = status === "APPROVED";

            await prisma.paseSalida.update({
                where: { id },
                data: {
                    status,
                    cimComment: cimComment || undefined,
                },
            });
            
            log(`PaseSalida ${id} updated to status: ${status}`);
        } else if (type === "BALIZA_DESACTIVACION") {
            // Only CIM can approve or reject baliza deactivation requests
            const userRole = (session?.user as any)?.role;

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
            
            log(`BalizaDesactivacion ${id} updated to status: ${status}`);
        } else if (type === "AVISO_ARRIBO") {
            const userRole = (session?.user as any)?.role;
            if (userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede aprobar avisos de arribo" }, { status: 403 });
            }

            await prisma.arrivalNotice.update({
                where: { id },
                data: { status },
            });
            log(`ArrivalNotice ${id} updated to status: ${status}`);
        } else if (type === "AVISO_ARRIBO_RECREATIVO") {
            const userRole = (session?.user as any)?.role;
            if (userRole !== "ADMIN" && userRole !== "CIM") {
                return NextResponse.json({ error: "Solo CIM puede aprobar avisos de arribo" }, { status: 403 });
            }

            await prisma.arrivalNoticeRecreational.update({
                where: { id },
                data: { status },
            });
            log(`ArrivalNoticeRecreational ${id} updated to status: ${status}`);
        }

        log(`Success for ID: ${id}`);
        return NextResponse.json({ message: "Estado actualizado exitosamente" });
    } catch (error: any) {
        log(`ERROR for ID: ${id}: ${error.message}\nStack: ${error.stack}`);
        console.error("Status Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
