"use client";

import { useState } from "react";
import { Printer, FileDown, Loader2, X, Eye, CheckCircle, Shield } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, PDFName, PDFString } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

interface PaseSalidaData {
    id: string;
    vesselName: string;
    registrationNum: string;
    operatorName: string;
    departureDate: Date | string;
    departureTime: string;
    departurePort: string;
    destination: string;
    activityType: string;
    email: string;
    crewList?: string | null;
    passengerList?: string | null;
    guideName?: string | null;
    signature?: string | null;
    createdAt: Date | string;
    status: string;
}

interface PrintPaseSalidaPDFButtonProps {
    pase: PaseSalidaData;
    downloadOnly?: boolean;
    label?: string;
}

export function PrintPaseSalidaPDFButton({ pase, downloadOnly = false, label }: PrintPaseSalidaPDFButtonProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);

    const generatePDF = async () => {
        setLoading(true);
        
        try {
            // Create PDF document (Letter size: 8.5 x 11 inches)
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([612, 792]);
            const { width, height } = page.getSize();
            const margin = 50;
            const contentWidth = width - (margin * 2);
            
            // Fonts
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            // Institutional Data
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            const verifyUrl = `${baseUrl}/verificar/pase/${pase.id}`;
            const createdDate = new Date(pase.createdAt);
            const portCode = pase.departurePort.substring(0, 3).toUpperCase() || 'UNK';
            const paseNumber = `${createdDate.getFullYear()}-DGMM-PSALIDA-${portCode}-${pase.id.substring(0, 5).toUpperCase()}`;

            // Colors
            const blueInstitutional = rgb(30/255, 58/255, 138/255); // blue-900
            const textMain = rgb(23/255, 23/255, 23/255); // neutral-900
            const textGray = rgb(115/255, 115/255, 115/255); // neutral-500
            const redOfficial = rgb(220/255, 38/255, 38/255); // red-600
            const bgLight = rgb(250/255, 250/255, 250/255); // neutral-50
            
            let y = height - margin;

            // 1. QR CODE (Left)
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 220 });
            const qrImage = await pdfDoc.embedPng(qrDataUrl);
            page.drawImage(qrImage, { x: margin, y: y - 80, width: 80, height: 80 });
            
            // Add clickable link to the QR code area
            const link = pdfDoc.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [margin, y - 80, margin + 80, y],
                Border: [0, 0, 0],
                A: {
                    Type: 'Action',
                    S: 'URI',
                    URI: PDFString.of(verifyUrl),
                },
            });
            const linkRef = pdfDoc.context.register(link);
            page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([linkRef]));

            page.drawText("Verificación Electrónica", { 
                x: margin, 
                y: y - 92, 
                size: 7, 
                font: helveticaFont, 
                color: textGray 
            });

            // 2. LOGO (Center)
            try {
                const logoResp = await fetch('/dgmm-seal-official.png');
                const logoBytes = await logoResp.arrayBuffer();
                const logoImage = await pdfDoc.embedPng(logoBytes);
                const logoWidth = 70;
                const logoHeight = 70;
                page.drawImage(logoImage, { 
                    x: (width / 2) - (logoWidth / 2), 
                    y: y - 70, 
                    width: logoWidth, 
                    height: logoHeight 
                });
            } catch (e) {
                console.warn("Logo could not be loaded into PDF", e);
            }

            // 3. INSTITUTIONAL HEADER (Center)
            const title = "DIRECCIÓN GENERAL DE LA MARINA MERCANTE DE HONDURAS";
            const titleWidth = helveticaBold.widthOfTextAtSize(title, 12);
            page.drawText(title, { 
                x: (width / 2) - (titleWidth / 2), 
                y: y - 90, 
                size: 12, 
                font: helveticaBold, 
                color: textMain 
            });

            const subtitle = "PASE DE SALIDA";
            const subtitleWidth = helveticaBold.widthOfTextAtSize(subtitle, 18);
            page.drawText(subtitle, { 
                x: (width / 2) - (subtitleWidth / 2), 
                y: y - 110, 
                size: 18, 
                font: helveticaBold, 
                color: blueInstitutional 
            });

            const numWidth = helveticaFont.widthOfTextAtSize(paseNumber, 10);
            page.drawText(paseNumber, { 
                x: (width / 2) - (numWidth / 2), 
                y: y - 125, 
                size: 10, 
                font: helveticaBold, 
                color: textGray 
            });

            // 4. DOCUMENT CODE (Right)
            page.drawText("CP.PS.01", { 
                x: width - margin - 45, 
                y: y - 15, 
                size: 9, 
                font: helveticaBold, 
                color: textGray 
            });

            y = height - 190;

            // Helper for sections
            const drawSection = (title: string) => {
                page.drawRectangle({ x: margin, y: y - 2, width: contentWidth, height: 18, color: bgLight });
                page.drawLine({ start: { x: margin, y: y - 3 }, end: { x: width - margin, y: y - 3 }, thickness: 1.5, color: blueInstitutional });
                page.drawText(title, { x: margin, y: y + 2, size: 9, font: helveticaBold, color: blueInstitutional });
                y -= 25;
            };

            const drawField = (label: string, value: string, x: number, w: number) => {
                page.drawText(label.toUpperCase(), { x: x, y: y, size: 7, font: helveticaBold, color: textGray });
                page.drawText(value || "-", { x: x, y: y - 12, size: 9, font: helveticaBold, color: textMain });
                page.drawLine({ start: { x: x, y: y - 16 }, end: { x: x + w, y: y - 16 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
            };

            // Section I: Datos de la Embarcación
            drawSection("I. DATOS DE LA EMBARCACIÓN -|- VESSEL DATA");
            drawField("Nombre de la Embarcación", pase.vesselName, margin, 250);
            drawField("Matrícula", pase.registrationNum, margin + 300, 150);
            y -= 35;
            drawField("Tipo de Actividad", pase.activityType, margin, 250);
            drawField("Estado", "AUTORIZADO", margin + 300, 150);
            y -= 45;

            // Section II: Detalles del Viaje
            drawSection("II. DETALLES DEL VIAJE -|- VOYAGE DETAILS");
            drawField("Puerto de Salida", pase.departurePort, margin, 200);
            drawField("Destino", pase.destination, margin + 300, 200);
            y -= 35;
            drawField("Fecha Salida", new Date(pase.departureDate).toLocaleDateString('es-HN'), margin, 150);
            drawField("Hora Salida", pase.departureTime, margin + 300, 150);
            y -= 35;
            drawField("Operador Responsable", pase.operatorName, margin, 250);
            drawField("Contacto", pase.email, margin + 300, 200);
            y -= 35;
            if (pase.guideName) {
                drawField("Nombre del Guía", pase.guideName, margin, 500);
                y -= 35;
            }
            y -= 10;

            // Section III: Tripulación y Pasajeros
            drawSection("III. TRIPULACIÓN Y PASAJEROS -|- CREW AND PASSENGERS");
            
            const crewText = `LISTA DE TRIPULANTES: ${pase.crewList || "No registrada"}`;
            const passengerText = `LISTA DE PASAJEROS: ${pase.passengerList || "No registrada"}`;
            
            page.drawText(crewText, { x: margin, y: y, size: 8, font: helveticaBold, color: textMain, maxWidth: contentWidth });
            y -= 40;
            page.drawText(passengerText, { x: margin, y: y, size: 8, font: helveticaBold, color: textMain, maxWidth: contentWidth });
            y -= 80;

            // SIGNATURES
            const sigY = y - 40;
            
            // Applicant Line
            page.drawLine({ start: { x: margin, y: sigY }, end: { x: margin + 200, y: sigY }, thickness: 1, color: textGray });
            page.drawText("FIRMA DEL OPERADOR / CAPITÁN", { x: margin, y: sigY - 12, size: 8, font: helveticaBold, color: textMain });
            
            if (pase.signature) {
                try {
                    let sigBytes: ArrayBuffer;
                    if (pase.signature.startsWith('data:')) {
                        const base64Data = pase.signature.split(',')[1];
                        sigBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
                    } else {
                        const sigUrl = pase.signature.startsWith('/uploads/') ? `/api${pase.signature}` : pase.signature;
                        const sigResp = await fetch(sigUrl);
                        sigBytes = await sigResp.arrayBuffer();
                    }
                    const sigImage = await pdfDoc.embedPng(sigBytes);
                    page.drawImage(sigImage, { x: margin + 50, y: sigY + 5, width: 100, height: 40 });
                } catch (e) {
                    console.error("Signature error:", e);
                }
            }

            // Authority Line (Always signed if APPROVED)
            const authX = width - margin - 200;
            page.drawLine({ start: { x: authX, y: sigY }, end: { x: authX + 200, y: sigY }, thickness: 1, color: blueInstitutional });
            page.drawText("CAPITÁN DE PUERTO / AUTORIDAD", { x: authX, y: sigY - 12, size: 8, font: helveticaBold, color: blueInstitutional });
            page.drawText("AUTORIZADO ELECTRÓNICAMENTE", { x: authX + 40, y: sigY + 10, size: 7, font: helveticaBold, color: blueInstitutional });

            // FOOTER
            y = 80;
            page.drawLine({ start: { x: margin, y: y }, end: { x: width - margin, y: y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
            const notice = "Este documento es una representación electrónica del pase oficial emitido por la Marina Mercante de Honduras.";
            const noticeWidth = helveticaBold.widthOfTextAtSize(notice, 7);
            page.drawText(notice, { x: (width / 2) - (noticeWidth / 2), y: y - 15, size: 7, font: helveticaBold, color: redOfficial });
            
            const footerText = `Emitido electrónicamente por el Sistema de Gestión Marítima Digitalacma • ${new Date().toLocaleString('es-HN')}`;
            const footerWidth = helveticaFont.widthOfTextAtSize(footerText, 7);
            page.drawText(footerText, { x: (width / 2) - (footerWidth / 2), y: y - 30, size: 7, font: helveticaFont, color: textGray });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            
            if (downloadOnly) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `PASE-SALIDA-${paseNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                window.open(url, '_blank');
            }
            setShowPreview(false);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF. Por favor intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
        setShowPreview(false);
    };

    if (downloadOnly) {
        return (
            <button
                onClick={generatePDF}
                disabled={loading}
                className="bg-emerald-600 text-white font-bold tracking-widest px-6 py-3 rounded-xl shadow-lg border-b-4 border-emerald-800 hover:scale-105 active:scale-95 transition-all uppercase text-xs flex items-center gap-2"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                {label || "Descargar PDF"}
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowPreview(true)}
                className="bg-brand-secondary text-white font-black tracking-widest px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all uppercase text-xs flex items-center gap-2"
            >
                <Printer size={16} />
                Ver Documento
            </button>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                                <div>
                                    <h2 className="font-bold text-lg">Vista Previa de Pase de Salida</h2>
                                    <p className="text-xs text-slate-400">Verifique los datos antes de imprimir o descargar</p>
                                </div>
                                <button 
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-200 flex justify-center">
                                {/* We reuse the component here but it might need some adjustments for the preview scale */}
                                <div className="shadow-2xl scale-90 origin-top">
                                    {/* Instead of importing it recursively, we'll just show a simplified version or the component itself without the button */}
                                    {/* To avoid circular dependency, we pass null to showPrintButton */}
                                    {/* Actually, let's just use the logic in PaseSalidaDocument but without its own print button */}
                                    <iframe 
                                        src="" 
                                        id="preview-frame"
                                        className="hidden"
                                    />
                                    {/* For now, just show the generated PDF or a text preview */}
                                    <div className="bg-white p-12 w-[210mm] min-h-[297mm] shadow-inner font-serif text-neutral-900 flex flex-col">
                                        <p className="text-center italic opacity-50 mb-8">Generando vista previa institucional...</p>
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center space-y-4">
                                                <Shield size={64} className="mx-auto text-blue-900 opacity-20" />
                                                <p className="font-bold text-slate-400">Pase de Salida Autorizado</p>
                                                <button 
                                                    onClick={generatePDF}
                                                    className="px-6 py-2 bg-blue-900 text-white rounded-lg font-bold"
                                                >
                                                    Actualizar Documento
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrint}
                                        className="px-6 py-2.5 rounded-xl bg-slate-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        <Printer size={16} />
                                        Imprimir
                                    </button>
                                    <button
                                        onClick={generatePDF}
                                        disabled={loading}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <FileDown size={16} />
                                        )}
                                        Descargar PDF
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
