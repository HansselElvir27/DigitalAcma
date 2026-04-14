"use client";

import { useState } from "react";
import { Printer, FileDown, Loader2, X, Eye, CheckCircle, Shield } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, PDFName, PDFString } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

interface ZarpeData {
    id: string;
    vesselName: string;
    registrationNum: string;
    captainName: string;
    departureDate: Date | string;
    destination: string;
    port: { name: string };
    user?: { email: string | null };
    signature?: string | null;
    omiNumber?: string | null;
    flag?: string | null;
    owner?: string | null;
    dimension?: string | null;
    tbr?: string | null;
    tnr?: string | null;
    rubro?: string | null;
    balizaNumber?: string | null;
    patent?: string | null;
    navegabilityCert?: string | null;
    consignee?: string | null;
    digepescaLicense?: string | null;
    radioFrequency?: string | null;
    carriesOnBoard?: string | null;
    firstOfficerName?: string | null;
    captainLicense?: string | null;
    firstOfficerLicense?: string | null;
    crewList?: string | null;
    zarpeNumber?: string | null;
    createdAt: Date | string;
}

interface PrintPDFButtonProps {
    zarpe: ZarpeData;
    downloadOnly?: boolean;
    label?: string;
}

export function PrintPDFButton({ zarpe, downloadOnly = false, label }: PrintPDFButtonProps) {
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
            const verifyUrl = `${baseUrl}/verificar/${zarpe.id}`;
            const createdDate = new Date(zarpe.createdAt);
            const generatedNumber = `${createdDate.getFullYear()}-DGMM-ZARPNAC-${zarpe.port.name.substring(0, 3).toUpperCase()}-${zarpe.id.substring(0, 5).toUpperCase()}`;
            const zarpeNumber = zarpe.zarpeNumber || generatedNumber;

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
            
            // Add clickable link to the QR code area in PDF
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

            const subIdWidth = helveticaBold.widthOfTextAtSize(zarpeNumber, 18);
            page.drawText(zarpeNumber, { 
                x: (width / 2) - (subIdWidth / 2), 
                y: y - 110, 
                size: 18, 
                font: helveticaBold, 
                color: textMain 
            });

            // 4. DOCUMENT CODE (Right)
            page.drawText("CP.R.35", { 
                x: width - margin - 40, 
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

            // Section I
            drawSection("GENERALIDADES DE LA NAVE -|- GENERAL SHIP'S DATA");
            drawField("Registro Oficial", zarpe.registrationNum, margin, 150);
            drawField("OMI", zarpe.omiNumber || "-", margin + 300, 150);
            y -= 35;
            drawField("Nombre de la Embarcación", zarpe.vesselName, margin, 250);
            drawField("Número de Baliza", zarpe.balizaNumber || "-", margin + 300, 150);
            y -= 35;
            drawField("Patente", zarpe.patent || "-", margin, 150);
            drawField("Certificado Navegabilidad", zarpe.navegabilityCert || "-", margin + 300, 200);
            y -= 35;
            drawField("Rubro", zarpe.rubro || "-", margin, 150);
            drawField("Licencia DIGEPESCA", zarpe.digepescaLicense || "-", margin + 300, 150);
            y -= 45;

            // Section II
            drawSection("CARACTERISTICAS PRINCIPALES -|- MAIN PARTICULARS");
            drawField("Dimensión", zarpe.dimension || "-", margin, 120);
            drawField("TBR", zarpe.tbr || "-", margin + 170, 120);
            drawField("TNR", zarpe.tnr || "-", margin + 340, 120);
            y -= 45;

            // Section III
            drawSection("DATOS DEL ZARPE -|- PORT CLEARANCE DATA");
            drawField("Consignado", zarpe.consignee || "-", margin, 500);
            y -= 35;
            drawField("Puerto", zarpe.port.name, margin, 200);
            drawField("Frecuencia Radio", zarpe.radioFrequency || "-", margin + 300, 150);
            y -= 35;
            drawField("Fecha Salida", new Date(zarpe.departureDate).toLocaleDateString('es-HN'), margin, 150);
            drawField("Destino", zarpe.destination, margin + 300, 200);
            y -= 45;
            drawField("Lleva a Bordo", zarpe.carriesOnBoard || "EN LASTRE", margin, 500);
            y -= 55;

            // Section IV
            drawSection("TRIPULACIÓN Y PASAJEROS -|- CREW AND PASSENGERS");
            drawField("Capitán", zarpe.captainName, margin, 250);
            drawField("Licencia Capitán", zarpe.captainLicense || "-", margin + 300, 150);
            y -= 40;
            
            // Crew List (Simple representation)
            page.drawText("LISTA DE TRIPULANTES", { x: margin, y: y, size: 7, font: helveticaBold, color: textGray });
            const crewSummary = zarpe.crewList ? zarpe.crewList.substring(0, 150) + "..." : "No hay tripulantes registrados.";
            page.drawText(crewSummary, { x: margin, y: y - 12, size: 8, font: helveticaFont, color: textMain, maxWidth: contentWidth });
            y -= 60;

            // SIGNATURES
            const sigY = y - 40;
            page.drawLine({ start: { x: margin, y: sigY }, end: { x: margin + 200, y: sigY }, thickness: 1, color: textGray });
            page.drawText("FIRMA RESPONSABLE - REQUESTING SIGNATURE", { x: margin, y: sigY - 12, size: 8, font: helveticaBold, color: textMain });
            
            if (zarpe.signature) {
                try {
                    let sigBytes: ArrayBuffer;
                    if (zarpe.signature.startsWith('data:')) {
                        // Base64 direct
                        const base64Data = zarpe.signature.split(',')[1];
                        sigBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
                    } else {
                        // Fetch from API
                        const sigUrl = zarpe.signature.startsWith('/uploads/') 
                            ? `/api${zarpe.signature}` 
                            : zarpe.signature;
                        const sigResp = await fetch(sigUrl);
                        sigBytes = await sigResp.arrayBuffer();
                    }
                    
                    const sigImage = await pdfDoc.embedPng(sigBytes);
                    page.drawImage(sigImage, { x: margin + 50, y: sigY + 5, width: 100, height: 40 });
                } catch (e) {
                    console.error("Zarpe signature PDF error:", e);
                }
            }

            // FOOTER
            y = 80;
            page.drawLine({ start: { x: margin, y: y }, end: { x: width - margin, y: y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
            const notice = "This is an electronic representation of the official document that will be in force once signed by the port member authority of Honduras.";
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
                link.download = `${zarpeNumber}.pdf`;
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

    const zarpeNumber = `ZN-${zarpe.port?.name?.substring(0, 3).toUpperCase() || 'UNK'}-${new Date(zarpe.createdAt).getFullYear()}-${zarpe.id.substring(0, 8).toUpperCase()}`;

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
            <div className="fixed bottom-8 right-8 print:hidden">
                <button
                    onClick={() => setShowPreview(true)}
                    className="bg-brand-primary text-brand-secondary font-black tracking-widest px-6 py-3 rounded-full shadow-2xl border-2 border-brand-secondary hover:scale-105 transition-all uppercase text-sm flex items-center gap-2"
                >
                    <Printer size={18} />
                    Imprimir Zarpe
                </button>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                                <div>
                                    <h2 className="font-bold text-lg">Vista Previa del Zarpe</h2>
                                    <p className="text-xs text-slate-400">Verifique los datos antes de imprimir</p>
                                </div>
                                <button 
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-200">
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto max-w-[210mm]">
                                    
                                    {/* Header */}
                                    <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-600 p-2 rounded-lg">
                                                <Shield size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h1 className="text-lg font-black uppercase">Pase de Zarpe Nacional</h1>
                                                <p className="text-[10px] opacity-70 font-bold uppercase">Autoridad Marítima de Honduras</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold uppercase opacity-70">No. Zarpe</p>
                                            <p className="font-mono font-bold text-emerald-400">{zarpeNumber}</p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="bg-green-50 px-4 py-2 flex items-center gap-2 border-b border-green-100">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <span className="text-xs font-bold text-green-800">Documento Autorizado y Válido</span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3 text-[10px]">
                                        
                                        {/* Section I */}
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                                <p className="font-black uppercase text-slate-600 text-[10px]">I. Generalidades de la Nave</p>
                                            </div>
                                            <div className="p-2 grid grid-cols-4 gap-2">
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Registro</p><p className="font-bold">{zarpe.registrationNum}</p></div>
                                                <div className="col-span-2"><p className="font-bold uppercase text-slate-400 text-[7px]">Nombre</p><p className="font-bold">{zarpe.vesselName}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Patente</p><p className="font-bold">{zarpe.patent || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Rubro</p><p className="font-bold">{zarpe.rubro || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Bandera</p><p className="font-bold">{zarpe.flag || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">OMI</p><p className="font-bold">{zarpe.omiNumber || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Propietario</p><p className="font-bold">{zarpe.owner || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Baliza</p><p className="font-bold">{zarpe.balizaNumber || '-'}</p></div>
                                                <div className="col-span-2"><p className="font-bold uppercase text-slate-400 text-[7px]">Cert. Navegabilidad</p><p className="font-bold">{zarpe.navegabilityCert || '-'}</p></div>
                                            </div>
                                        </div>

                                        {/* Section II */}
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                                <p className="font-black uppercase text-slate-600 text-[10px]">II. Características Principales</p>
                                            </div>
                                            <div className="p-2 flex gap-6">
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Dimensión</p><p className="font-bold">{zarpe.dimension || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">TBR</p><p className="font-bold">{zarpe.tbr || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">TNR</p><p className="font-bold">{zarpe.tnr || '-'}</p></div>
                                            </div>
                                        </div>

                                        {/* Section III */}
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                                <p className="font-black uppercase text-slate-600 text-[10px]">III. Datos del Zarpe</p>
                                            </div>
                                            <div className="p-2 grid grid-cols-4 gap-2">
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Consignado</p><p className="font-bold">{zarpe.consignee || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Puerto</p><p className="font-bold">{zarpe.port?.name}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Frec. Radio</p><p className="font-bold">{zarpe.radioFrequency || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Destino</p><p className="font-bold text-emerald-600">{zarpe.destination}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Fecha</p><p className="font-bold">{new Date(zarpe.departureDate).toLocaleDateString()}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Hora</p><p className="font-bold">{new Date(zarpe.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                                                <div className="col-span-2"><p className="font-bold uppercase text-slate-400 text-[7px]">Email</p><p className="font-bold">{zarpe.user?.email || '-'}</p></div>
                                                <div className="col-span-2"><p className="font-bold uppercase text-slate-400 text-[7px]">DIGEPESCA</p><p className="font-bold">{zarpe.digepescaLicense || '-'}</p></div>
                                                <div className="col-span-4"><p className="font-bold uppercase text-slate-400 text-[7px]">Lleva a Bordo</p><p className="font-bold bg-slate-50 p-1 rounded">{zarpe.carriesOnBoard || 'No especificado'}</p></div>
                                            </div>
                                        </div>

                                        {/* Section IV */}
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200">
                                                <p className="font-black uppercase text-slate-600 text-[10px]">IV. Tripulación</p>
                                            </div>
                                            <div className="p-2 grid grid-cols-4 gap-2">
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Capitán</p><p className="font-bold">{zarpe.captainName}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Licencia</p><p className="font-bold">{zarpe.captainLicense || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">1er Oficial</p><p className="font-bold">{zarpe.firstOfficerName || '-'}</p></div>
                                                <div><p className="font-bold uppercase text-slate-400 text-[7px]">Licencia</p><p className="font-bold">{zarpe.firstOfficerLicense || '-'}</p></div>
                                                <div className="col-span-4"><p className="font-bold uppercase text-slate-400 text-[7px]">Lista de Tripulantes</p><p className="font-bold bg-slate-50 p-1 rounded max-h-16 overflow-auto">{zarpe.crewList || 'No especificada'}</p></div>
                                            </div>
                                        </div>

                                        {/* Signatures */}
                                        <div className="flex gap-3 pt-2">
                                            <div className="flex-1 border border-slate-200 rounded-lg p-2 flex flex-col justify-end">
                                                <div className="h-8 border-b border-slate-300 flex items-center justify-center">
                                                    <p className="text-[8px] font-black uppercase text-emerald-600 italic">AUTORIZADO DIGITALMENTE</p>
                                                </div>
                                                <p className="text-[7px] font-bold uppercase text-center">Firma Capitán de Puerto</p>
                                                <p className="text-[6px] text-center text-slate-400">{zarpe.port?.name}</p>
                                            </div>
                                            <div className="flex-1 border border-slate-200 rounded-lg p-2 flex flex-col justify-end">
                                                <div className="h-8 border-b border-slate-300 flex items-center justify-center">
                                                    {zarpe.signature ? (
                                                        <img src={zarpe.signature?.startsWith('/uploads/') ? `/api${zarpe.signature}` : zarpe.signature} alt="Firma" className="max-h-6 opacity-80" />
                                                    ) : (
                                                        <p className="text-[8px] text-slate-300">Sin firma</p>
                                                    )}
                                                </div>
                                                <p className="text-[7px] font-bold uppercase text-center">Firma Responsable</p>
                                                <p className="text-[6px] text-center text-slate-400">Capitán {zarpe.captainName}</p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="pt-2 border-t border-slate-200">
                                            <p className="text-[6px] text-center text-slate-400">
                                                Documento oficial de Zarpe Nacional • Autoridad Marítima de Honduras • {new Date().toLocaleString()}
                                            </p>
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
                                    Cancelar
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

