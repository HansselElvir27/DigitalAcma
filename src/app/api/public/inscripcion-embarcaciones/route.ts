import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

const prisma = getPrismaClient();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export async function POST(request: Request) {
  // Log request start
  console.log("=== Inscripción POST start ===");

  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { fullName, phone, email, portId } = body;

    // Basic validation
    if (!fullName?.trim() || !phone?.trim() || !email?.trim() || !portId?.trim()) {
      console.log("Validation failed: missing fields");
      return NextResponse.json({
        success: false,
        error: "Faltan datos requeridos: fullName, phone, email, portId"
      }, { status: 400 });
    }

    // Email format
    if (!isValidEmail(email)) {
      console.log("Invalid email:", email);
      return NextResponse.json({
        success: false,
        error: "Email inválido"
      }, { status: 400 });
    }

    // Phone format
    if (!isValidPhone(phone)) {
      console.log("Invalid phone:", phone);
      return NextResponse.json({
        success: false,
        error: "Teléfono inválido (use formato internacional)"
      }, { status: 400 });
    }

    // Verify port exists
    const port = await prisma.port.findUnique({ where: { id: portId } });
    if (!port) {
      console.log("Port not found:", portId);
      return NextResponse.json({
        success: false,
        error: `Capitanía de puerto no encontrada: ${portId}`
      }, { status: 400 });
    }
    console.log("Port validated:", port.name);

    // Sequential creates for Neon HTTP (no transactions/nesting)
    console.log("Creating user...");
    let userData = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (userData) {
      userData = await prisma.user.update({
        where: { id: userData.id },
        data: { name: fullName.trim() }
      });
    } else {
      userData = await prisma.user.create({
        data: {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role: "PUBLIC"
        }
      });
    }
    console.log("User:", userData.id);

    console.log("Creating request...");
    const requestData = await prisma.embarcacionInscripcionRequest.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        portId: portId,
        userId: userData.id
      }
    });

    console.log("Request created:", requestData.id);

    // Create notification for CIM and Capitanía
    await createNotification({
        title: "Nueva Inspección de Embarcación",
        message: `Solicitante: ${fullName}. Puerto: ${port.name}`,
        type: "INSPECTION",
        link: `/dashboard/inscripcion-embarcaciones`,
        portId: portId
    });

    return NextResponse.json({ success: true, request: requestData });

  } catch (error: any) {
    console.error("=== Inscripción ERROR ===", error);
    console.error("Error stack:", error.stack);
    console.error("=== END ERROR ===");

    return NextResponse.json({
      success: false,
      error: `Error interno: ${error.message || 'Error desconocido'}`
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const requests = await prisma.embarcacionInscripcionRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        port: true,
        user: true,
        vesselRegistration: true
      }
    });
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Error fetching inscripcion requests:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

