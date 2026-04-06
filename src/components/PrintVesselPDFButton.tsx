"use client";

import { useState } from "react";
import { Printer, FileDown, Loader2 } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, PDFName, PDFString } from "pdf-lib";
import QRCode from "qrcode";

interface VesselData {
    id: string;
    registrationNumber: string;
    vesselName: string;
    eslora?: string | null;
    manga?: string | null;
    punta?: string | null;
    calado?: string | null;
    passengerCapacity?: string | null;
    crewCapacity?: string | null;
    engineBrand?: string | null;
    engineSerials?: any;
    ownerId?: string | null;
    ownerName?: string | null;
    vesselType?: string | null;
    activityType?: string | null;
    yearBuilt?: string | null;
    grossTonnage?: string | null;
    netTonnage?: string | null;
    color?: string | null;
    hullMaterial?: string | null;
    route?: string | null;
    observations?: string | null;
    issueDate?: Date | string | null;
    expirationDate?: Date | string | null;
    phone?: string | null;
    rtn?: string | null;
    port: { name: string };
    captain?: { name: string | null } | null;
    captainSignature?: string | null;
}

export function PrintVesselPDFButton({ vessel }: { vessel: VesselData }) {
    const [loading, setLoading] = useState(false);

    const generatePDF = async () => {
        setLoading(true);
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([612, 792]);
            const { width, height } = page.getSize();
            const margin = 50;
            const contentWidth = width - (margin * 2);
            
            const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const helvItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

            const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            const verifyUrl = `${baseUrl}/verificar/vessel/${vessel.id}`;

            // Colors
            const blueInstitutional = rgb(30/255, 58/255, 138/255);
            const redOfficial = rgb(220/255, 38/255, 38/255);
            const textMain = rgb(23/255, 23/255, 23/255);
            const textSecondary = rgb(107/255, 114/255, 128/255);
            const bgLight = rgb(250/255, 250/255, 250/255);
            const amberBg = rgb(255/255, 251/255, 235/255);
            const amberBorder = rgb(254/255, 243/255, 199/255);
            const blueLightBg = rgb(239/255, 246/255, 255/255);
            const blueLightBorder = rgb(219/255, 234/255, 254/255);

            let y = height - margin;

            // 1. QR CODE (Left)
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 220 });
            const qrImage = await pdfDoc.embedPng(qrDataUrl);
            page.drawImage(qrImage, { x: margin, y: y - 80, width: 80, height: 80 });
            page.drawText("VERIFICACIÓN ELECTRÓNICA", { x: margin, y: y - 92, size: 7, font: helv, color: textSecondary });

            // 2. SEAL (Center)
            try {
                const logoResp = await fetch('/dgmm-seal-official.png');
                const logoBytes = await logoResp.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                page.drawImage(logoImage, { x: (width/2) - 40, y: y - 80, width: 80, height: 80 });
            } catch(e){}

            // 3. HEADER TEXT
            y -= 100;
            const title = "DIRECCIÓN GENERAL DE LA MARINA MERCANTE DE HONDURAS";
            const titleWidth = helvBold.widthOfTextAtSize(title, 11);
            page.drawText(title, { x: (width/2) - (titleWidth/2), y, size: 11, font: helvBold, color: textMain });
            
            y -= 25;
            const subtitle = "PERMISO DE NAVEGACIÓN";
            const subtitleWidth = helvBold.widthOfTextAtSize(subtitle, 18);
            page.drawText(subtitle, { x: (width/2) - (subtitleWidth/2), y, size: 18, font: helvBold, color: blueInstitutional });
            
            y -= 25;
            const regNum = vessel.registrationNumber;
            const regWidth = helvBold.widthOfTextAtSize(regNum, 16);
            page.drawText(regNum, { x: (width/2) - (regWidth/2), y, size: 16, font: helvBold, color: redOfficial });

            // 4. DOC CODE (Right)
            page.drawText("REG-NAV-V1", { x: width - margin - 60, y: height - margin - 15, size: 8, font: helvBold, color: textSecondary });

            y -= 40;

            // Helpers
            const drawSectionHeader = (label: string) => {
                page.drawLine({ start: { x: margin, y: y - 3 }, end: { x: width - margin, y: y - 3 }, thickness: 1.5, color: blueInstitutional });
                page.drawText(label.toUpperCase(), { x: margin, y, size: 9, font: helvBold, color: blueInstitutional });
                y -= 25;
            };

            const drawField = (label: string, value: string, x: number, w: number, isBold: boolean = false) => {
                page.drawText(label.toUpperCase(), { x, y, size: 7, font: helvBold, color: textSecondary });
                page.drawText(String(value || "-").toUpperCase(), { x, y: y - 12, size: 9, font: isBold ? helvBold : helv, color: textMain });
                page.drawLine({ start: { x, y: y-16 }, end: { x: x+w, y: y-16 }, thickness: 0.5, color: rgb(0.95, 0.95, 0.95) });
            };

            const col1 = margin;
            const col2 = margin + (contentWidth / 2) + 10;
            const colWidth = (contentWidth / 2) - 10;

            // SECTION I: Datos de la Embarcación
            drawSectionHeader("I. Datos de la Embarcación");
            drawField("Nombre de Embarcación", vessel.vesselName, col1, colWidth, true);
            drawField("Tipo", vessel.vesselType || "-", col2, colWidth);
            y -= 35;
            drawField("Actividad", vessel.activityType || "-", col1, colWidth);
            drawField("Año de Construcción", vessel.yearBuilt || "-", col2, colWidth);
            y -= 35;
            drawField("Material del Casco", vessel.hullMaterial || "-", col1, colWidth);
            drawField("Color", vessel.color || "-", col2, colWidth);
            y -= 35;
            drawField("Ruta de Navegación", vessel.route || "-", col1, contentWidth);
            y -= 45;

            // SECTION II: Características Técnicas
            drawSectionHeader("II. Características Técnicas");
            drawField("Eslora", vessel.eslora || "-", col1, colWidth / 2);
            drawField("Manga", vessel.manga || "-", col1 + (colWidth / 2), colWidth / 2);
            drawField("Punta", vessel.punta || "-", col2, colWidth / 2);
            drawField("Calado", vessel.calado || "-", col2 + (colWidth / 2), colWidth / 2);
            y -= 35;
            drawField("Tonelaje Bruto (TBR)", vessel.grossTonnage || "-", col1, colWidth);
            drawField("Tonelaje Neto (TNR)", vessel.netTonnage || "-", col2, colWidth);
            y -= 35;
            drawField("Capacidad Pasajeros", vessel.passengerCapacity || "-", col1, colWidth);
            drawField("Capacidad Tripulación", vessel.crewCapacity || "-", col2, colWidth);
            y -= 45;

            // SECTION III: Planta Propulsora
            drawSectionHeader("III. Planta Propulsora");
            drawField("Marca de Motor", vessel.engineBrand || "-", col1, colWidth);
            y -= 35;
            const engineSerialsArr = Array.isArray(vessel.engineSerials) ? vessel.engineSerials : [];
            page.drawText("SERIES DE MOTORES", { x: col1, y, size: 7, font: helvBold, color: textSecondary });
            const serialsText = engineSerialsArr.length > 0 ? engineSerialsArr.join(" | ") : "NO REGISTRADAS";
            page.drawText(serialsText, { x: col1, y: y - 12, size: 8, font: helvBold, color: textMain });
            y -= 25;
            
            y -= 20;

            // SECTION IV: Datos del Propietario
            drawSectionHeader("IV. Datos del Propietario");
            drawField("Nombre del Propietario", vessel.ownerName || "-", col1, colWidth, true);
            drawField("Identidad", vessel.ownerId || "-", col2, colWidth);
            y -= 35;
            drawField("RTN", vessel.rtn || "-", col1, colWidth);
            drawField("Teléfono", vessel.phone || "-", col2, colWidth);
            y -= 50;

            // VIGENCIA & OBSERVACIONES (Boxes)
            const boxHeight = 60;
            const boxY = y - boxHeight;
            
            // Vigencia Box
            page.drawRectangle({ x: col1, y: boxY, width: colWidth, height: boxHeight, color: blueLightBg, borderColor: blueLightBorder, borderWidth: 1 });
            page.drawText("VIGENCIA DEL PERMISO", { x: col1 + 10, y: y - 15, size: 8, font: helvBold, color: blueInstitutional });
            
            const formatDate = (date: any) => date ? new Date(date).toLocaleDateString('es-HN') : "-";
            page.drawText("EMISIÓN:", { x: col1 + 10, y: y - 35, size: 7, font: helvBold, color: textSecondary });
            page.drawText(formatDate(vessel.issueDate), { x: col1 + 60, y: y - 35, size: 9, font: helvBold, color: textMain });
            
            page.drawText("EXPIRACIÓN:", { x: col1 + 10, y: y - 50, size: 7, font: helvBold, color: textSecondary });
            page.drawText(formatDate(vessel.expirationDate), { x: col1 + 60, y: y - 50, size: 9, font: helvBold, color: redOfficial });

            // Observations Box
            page.drawRectangle({ x: col2, y: boxY, width: colWidth, height: boxHeight, color: amberBg, borderColor: amberBorder, borderWidth: 1 });
            page.drawText("OBSERVACIONES", { x: col2 + 10, y: y - 15, size: 8, font: helvBold, color: rgb(146/255, 64/255, 14/255) });
            const obs = vessel.observations || "Sin observaciones adicionales.";
            page.drawText(obs, { x: col2 + 10, y: y - 30, size: 8, font: helvItalic, color: textSecondary, maxWidth: colWidth - 20, lineHeight: 10 });

            y -= 100;

            // SIGNATURE
            const sigWidth = 220;
            const sigX = (width / 2) - (sigWidth / 2);
            page.drawLine({ start: { x: sigX, y }, end: { x: sigX + sigWidth, y }, thickness: 1, color: textSecondary });
            
            if (vessel.captainSignature) {
                try {
                    const sigImage = await pdfDoc.embedPng(vessel.captainSignature);
                    page.drawImage(sigImage, { x: sigX + 60, y: y + 5, width: 100, height: 40 });
                } catch(e){}
            } else {
                const captainName = vessel.captain?.name || "CAPITÁN DE PUERTO";
                const cNameWidth = helvBold.widthOfTextAtSize(captainName, 10);
                page.drawText(captainName.toUpperCase(), { x: (width/2) - (cNameWidth/2), y: y + 15, size: 10, font: helvItalic, color: textMain });
            }

            const sigLabel = `CAPITÁN DE PUERTO DIGITAL - ${vessel.port.name.toUpperCase()}`;
            const sigLabelWidth = helvBold.widthOfTextAtSize(sigLabel, 9);
            page.drawText(sigLabel, { x: (width/2) - (sigLabelWidth/2), y: y - 15, size: 9, font: helvBold, color: blueInstitutional });
            
            const instText = "DIRECCIÓN GENERAL DE LA MARINA MERCANTE";
            const instWidth = helv.widthOfTextAtSize(instText, 7);
            page.drawText(instText, { x: (width/2) - (instWidth/2), y: y - 27, size: 7, font: helv, color: textSecondary });

            // FOOTER
            const footerText = `Documento oficial generado electrónicamente por el Sistema Digitalacma • Honduras • ${new Date().toLocaleString('es-HN')}`;
            const footerWidth = helv.widthOfTextAtSize(footerText, 7);
            page.drawText(footerText, { x: (width / 2) - (footerWidth / 2), y: 30, size: 7, font: helvItalic, color: textSecondary });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch(e){
            console.error(e);
            alert("Error al generar PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={generatePDF}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
            Descargar PDF
        </button>
    );
}
