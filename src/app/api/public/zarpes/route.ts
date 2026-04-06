import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

const prisma = getPrismaClient();

// Increase max body size to handle base64 file attachments
export const config = {
    api: {
        bodyParser: {
            sizeLimit: "50mb",
        },
    },
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        console.log("Zarpe request received:", JSON.stringify(body, null, 2));
        
        const {
            name, email, vesselName, registrationNum,
            portName, destination, departureDate, departureTime,
            signature,
            // New fields
            omiNumber, flag, owner, dimension, tbr, tnr, rubro,
            balizaNumber, patent, navegabilityCert, consignee,
            digepescaLicense, radioFrequency, carriesOnBoard, carriesOnBoardAttachment,
            firstOfficerName, captainLicense, firstOfficerLicense,
            crewList, crewListFile, passengerListFile, paymentReceiptFile
        } = body;

        if (!name || !email || !vesselName || !registrationNum || !portName || !destination || !departureDate || !departureTime || !signature) {
            return NextResponse.json({ error: "Faltan datos requeridos incluyendo la firma" }, { status: 400 });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find or create public user
        let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            user = await prisma.user.create({
                data: { name, email: normalizedEmail, role: "PUBLIC" }
            });
        }

        // Find existing port
        const port = await prisma.port.findUnique({ where: { name: portName } });
        if (!port) {
            return NextResponse.json({ error: "El puerto seleccionado no es válido o no existe en el sistema" }, { status: 400 });
        }

        // Combine date and time
        const fullDateTime = new Date(`${departureDate}T${departureTime}:00`);

        // Create the Zarpe request with all new fields
        const newZarpe = await prisma.zarpeRequest.create({
            data: {
                vesselName,
                registrationNum,
                captainName: name,
                departureDate: fullDateTime,
                destination,
                signature,
                userId: user.id,
                portId: port.id,
                // New fields
                omiNumber: omiNumber || null,
                flag: flag || null,
                owner: owner || null,
                dimension: dimension || null,
                tbr: tbr || null,
                tnr: tnr || null,
                rubro: rubro || null,
                balizaNumber: balizaNumber || null,
                patent: patent || null,
                navegabilityCert: navegabilityCert || null,
                consignee: consignee || null,
                digepescaLicense: digepescaLicense || null,
                radioFrequency: radioFrequency || null,
                carriesOnBoard: carriesOnBoard || null,
                carriesOnBoardAttachment: carriesOnBoardAttachment || null,
                firstOfficerName: firstOfficerName || null,
                captainLicense: captainLicense || null,
                firstOfficerLicense: firstOfficerLicense || null,
                crewList: crewList || null,
                crewListFile: crewListFile || null,
                passengerListFile: passengerListFile || null,
                paymentReceiptFile: paymentReceiptFile || null,
            }
        });

        // Create notification for CIM and Capitanía
        await createNotification({
            title: "Nueva Solicitud de Zarpe",
            message: `Embarcación: ${vesselName}. Capitán: ${name}. Destino: ${destination}`,
            type: "ZARPE",
            link: `/dashboard/zarpes`,
            portId: port.id
        });

        return NextResponse.json({ success: true, request: newZarpe });
    } catch (error: any) {
        console.error("Public Zarpe Error:", error.message, error.stack);
        return NextResponse.json({ error: `Error interno del servidor: ${error.message}` }, { status: 500 });
    }
}
