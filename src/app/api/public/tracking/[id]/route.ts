import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // First, try to find an InformationRequest
        const infoRequest = await prisma.informationRequest.findUnique({
            where: { id },
            include: { user: { select: { name: true } } }
        });

        if (infoRequest) {
            return NextResponse.json({
                ...infoRequest,
                type: "INFO",
                subject: infoRequest.subject,
                message: infoRequest.message
            });
        }

        // If not found, try to find a ZarpeRequest
        const zarpeRequest = await prisma.zarpeRequest.findUnique({
            where: { id },
            include: { 
                user: { select: { name: true, email: true } },
                port: { select: { name: true } }
            }
        });

        if (zarpeRequest) {
            return NextResponse.json({
                ...zarpeRequest,
                type: "ZARPE",
                subject: `Zarpe: ${zarpeRequest.vesselName} - ${zarpeRequest.destination}`,
                message: `Puerto: ${zarpeRequest.port?.name} - Destino: ${zarpeRequest.destination} - Fecha: ${new Date(zarpeRequest.departureDate).toLocaleDateString()}`
            });
        }

        // If not found, try to find a PaseSalida
        const paseSalida = await prisma.paseSalida.findUnique({
            where: { id },
            include: { 
                user: { select: { name: true, email: true } }
            }
        });

        if (paseSalida) {
            return NextResponse.json({
                ...paseSalida,
                type: "PASE_SALIDA",
                subject: `Pase de Salida: ${paseSalida.vesselName} - ${paseSalida.destination}`,
                message: `Puerto: ${paseSalida.departurePort} - Destino: ${paseSalida.destination} - Fecha: ${new Date(paseSalida.departureDate).toLocaleDateString()} - Actividad: ${paseSalida.activityType}`
            });
        }

        // If not found, try to find a BalizaDesactivacion
        const balizaDesactivacion = await prisma.balizaDesactivacion.findUnique({
            where: { id },
            include: { 
                user: { select: { name: true, email: true } }
            }
        });

        if (balizaDesactivacion) {
            return NextResponse.json({
                ...balizaDesactivacion,
                type: "BALIZA_DESACTIVACION",
                subject: `Desactivación de Baliza: ${balizaDesactivacion.nombreEmbarcacion}`,
                message: `Solicitante: ${balizaDesactivacion.nombreSolicitante} - Embarcación: ${balizaDesactivacion.nombreEmbarcacion} - Capitania: ${balizaDesactivacion.capitaniaPuerto} - Status: ${balizaDesactivacion.status}`
            });
        }

        // If not found, try to find EmbarcacionInscripcionRequest
        const inscripcionRequest = await prisma.embarcacionInscripcionRequest.findUnique({
            where: { id },
            include: { 
                port: { select: { name: true } },
                user: { select: { name: true, email: true } }
            }
        });

        if (inscripcionRequest) {
            return NextResponse.json({
                ...inscripcionRequest,
                type: "INSCRIPCION_EMBARCACIONES",
                subject: `Inscripción Embarcación: ${inscripcionRequest.fullName}`,
                message: `Puerto: ${inscripcionRequest.port?.name} - Tel: ${inscripcionRequest.phone} - Status: ${inscripcionRequest.status}${inscripcionRequest.citaNumber ? ` - Cita: ${inscripcionRequest.citaNumber}` : ''}`
            });
        }

        // Try ArrivalNotice
        const arrivalNotice = await prisma.arrivalNotice.findUnique({
            where: { id },
            include: { user: { select: { email: true } } }
        });

        if (arrivalNotice) {
            return NextResponse.json({
                ...arrivalNotice,
                type: "AVISO_ARRIBO",
                subject: `Aviso de Arribo: ${arrivalNotice.distinctiveSignal}`,
                message: `Puerto: ${arrivalNotice.arrivalPort} - ETA: ${new Date(arrivalNotice.etaDate).toLocaleString()}`
            });
        }

        // Try ArrivalNoticeRecreational
        const recreationalNotice = await prisma.arrivalNoticeRecreational.findUnique({
            where: { id },
            include: { user: { select: { email: true } } }
        });

        if (recreationalNotice) {
            return NextResponse.json({
                ...recreationalNotice,
                type: "AVISO_ARRIBO_RECREATIVO",
                subject: `Arribo Recreativo: ${recreationalNotice.vesselName}`,
                message: `Puerto: ${recreationalNotice.arrivalPort} - ETA: ${new Date(recreationalNotice.etaDate).toLocaleString()}`
            });
        }

        return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al consultar la solicitud" }, { status: 500 });
    }
}
