"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Ship, Anchor, MapPin, Calendar, Clock, CheckCircle, ShieldCheck, PenTool, User, Users, LifeBuoy } from "lucide-react";
import { PrintPaseSalidaPDFButton } from "./PrintPaseSalidaPDFButton";

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

interface PaseSalidaDocumentProps {
    pase: PaseSalidaData;
    showPrintButton?: boolean;
    showDownloadButton?: boolean;
}

export function PaseSalidaDocument({ pase, showPrintButton = true, showDownloadButton = true }: PaseSalidaDocumentProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Official Verification URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verificar/pase/${pase.id}`;

    // Official Pase Number
    const createdDate = new Date(pase.createdAt);
    const portCode = pase.departurePort.substring(0, 3).toUpperCase() || 'UNK';
    const paseNumber = `${createdDate.getFullYear()}-DGMM-PSALIDA-${portCode}-${pase.id.substring(0, 5).toUpperCase()}`;

    // Date Formatting
    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const formatFullDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('es-HN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white p-12 print:p-8 w-full border border-neutral-200 print:border-none relative font-serif text-neutral-900 overflow-y-auto max-w-4xl mx-auto shadow-2xl">
            {/* PDF Header Layout */}
            <div className="flex justify-between items-start mb-8 border-b-0">
                {/* Left: QR Code */}
                <div className="flex flex-col items-center min-w-[110px]">
                    {mounted ? (
                        <a 
                            href={verifyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-105 active:scale-95 group relative"
                            title="Haz clic para verificar este documento"
                        >
                            <QRCodeSVG value={verifyUrl} size={110} level="H" />
                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded" />
                        </a>
                    ) : (
                        <div className="w-[110px] h-[110px] bg-neutral-100 animate-pulse rounded" />
                    )}
                    <p className="text-[9px] mt-2 text-neutral-500 font-sans">Verificación Electrónica</p>
                </div>

                {/* Center: Institutional Header */}
                <div className="flex flex-col items-center flex-1 px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <img src="/dgmm-seal-official.png" alt="Sello Marina Mercante" className="h-32 w-auto" />
                    </div>
                    
                    <h1 className="text-lg font-black text-neutral-800 tracking-tight mb-4 text-center font-sans uppercase">
                        DIRECCIÓN GENERAL DE LA MARINA MERCANTE DE HONDURAS
                    </h1>

                    <h2 className="text-2xl font-black text-neutral-800 tracking-tight mb-1 text-center font-sans uppercase text-blue-900">
                        PASE DE SALIDA
                    </h2>
                    <p className="text-sm font-bold text-neutral-500 font-sans">{paseNumber}</p>
                </div>

                {/* Right: Doc Code & Action */}
                <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-[10px] font-bold text-neutral-400 font-sans">CP.PS.01</p>
                    {showDownloadButton && mounted && (
                        <div className="print:hidden">
                            <PrintPaseSalidaPDFButton pase={pase as any} downloadOnly label="Descargar PDF" />
                        </div>
                    )}
                </div>
            </div>

            {/* Banner de Estado (Solo visible en pantalla si es aprobado) */}
            {pase.status === 'APPROVED' && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 flex items-center gap-3 print:hidden">
                    <ShieldCheck className="text-green-600" size={24} />
                    <div>
                        <p className="text-xs font-black text-green-800 uppercase tracking-widest">Documento Autorizado</p>
                        <p className="text-[10px] text-green-600 font-sans">Este pase de salida es válido para la fecha y destino especificados.</p>
                    </div>
                </div>
            )}

            {/* Section I: DATOS DE LA EMBARCACIÓN */}
            <section className="mb-6">
                <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Ship size={14} /> DATOS DE LA EMBARCACIÓN -|- VESSEL DATA
                </h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Nombre de la Embarcación</span>
                        <span className="text-[10px] text-neutral-900 font-black uppercase">{pase.vesselName}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Matrícula / Registro</span>
                        <span className="text-[10px] text-neutral-900 font-medium font-mono uppercase">{pase.registrationNum}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Tipo de Actividad</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{pase.activityType}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Estado</span>
                        <span className="text-[10px] text-green-700 font-bold uppercase">{pase.status}</span>
                    </div>
                </div>
            </section>

            {/* Section II: DETALLES DEL VIAJE */}
            <section className="mb-6">
                <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <MapPin size={14} /> DETALLES DEL VIAJE -|- VOYAGE DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Puerto de Salida</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{pase.departurePort}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Destino</span>
                        <span className="text-[10px] text-blue-900 font-black uppercase">{pase.destination}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Fecha de Salida</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{formatFullDate(pase.departureDate)}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Hora de Salida</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{pase.departureTime}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Operador Responsable</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{pase.operatorName}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Contacto</span>
                        <span className="text-[10px] text-neutral-900 font-medium">{pase.email}</span>
                    </div>
                    {pase.guideName && (
                        <div className="col-span-2 flex justify-between border-b border-neutral-100 pb-1">
                            <span className="text-[10px] font-bold text-neutral-700 uppercase">Nombre del Guía</span>
                            <span className="text-[10px] text-neutral-900 font-medium uppercase">{pase.guideName}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Section III: TRIPULACIÓN Y PASAJEROS */}
            <section className="mb-12">
                <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Users size={14} /> TRIPULACIÓN Y PASAJEROS -|- CREW AND PASSENGERS
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Listado de Tripulantes</span>
                        <div className="text-[9px] text-neutral-600 font-sans whitespace-pre-wrap leading-tight bg-neutral-50 p-4 rounded border border-neutral-100 min-h-[80px]">
                            {pase.crewList || 'No se registraron tripulantes adicionales.'}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Listado de Pasajeros</span>
                        <div className="text-[9px] text-neutral-600 font-sans whitespace-pre-wrap leading-tight bg-neutral-50 p-4 rounded border border-neutral-100 min-h-[80px]">
                            {pase.passengerList || 'No se registraron pasajeros.'}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer and Signatures */}
            <div className="mt-auto pt-12">
                <div className="flex justify-between items-end border-t border-neutral-100 pt-8">
                    {/* Applicant Signature */}
                    <div className="flex flex-col items-center w-64">
                        <div className="w-full h-16 flex items-center justify-center border-b border-neutral-300 mb-2 relative">
                            {pase.signature ? (
                                <div className="bg-slate-50 p-1 rounded">
                                    <img 
                                        src={pase.signature.startsWith('/uploads/') ? `/api${pase.signature}` : pase.signature} 
                                        alt="Firma Solicitante" 
                                        className="max-h-14 opacity-95 object-contain" 
                                    />
                                </div>
                            ) : (
                                <div className="text-[8px] text-neutral-300 absolute italic">Pendiente de Firma</div>
                            )}
                        </div>
                        <p className="text-[9px] font-bold text-neutral-700 uppercase font-sans">Firma del Operador / Capitán</p>
                    </div>

                    {/* Authority Signature */}
                    <div className="flex flex-col items-center w-64">
                        <div className="w-full flex items-center justify-center mb-2 relative min-h-[64px]">
                            {pase.status === 'APPROVED' ? (
                                <div className="flex flex-col items-center relative py-2 w-full">
                                    <div className="absolute inset-0 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-900/20" />
                                    <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-center gap-2">
                                            <img src="/dgmm-seal-official.png" alt="Sello DGMM" className="h-8 w-8 opacity-80 mix-blend-multiply" />
                                            <div className="flex flex-col">
                                                <span className="text-blue-900 text-[6px] font-black uppercase tracking-widest text-left leading-none">AUTORIZADO ELECTRÓNICAMENTE</span>
                                                <span className="text-blue-700 text-[5px] font-mono text-left">DGMM-HONDU-VERIF-OK</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[8px] text-neutral-300 absolute py-6 italic">Pendiente de Autorización</div>
                            )}
                        </div>
                        <div className="border-t border-neutral-300 w-full mb-1"></div>
                        <p className="text-[9px] font-bold text-blue-900 uppercase font-sans">Capitán de Puerto / Autoridad</p>
                    </div>
                </div>

                <div className="mt-12 text-center border-t border-neutral-100 pt-4">
                    <p className="text-[10px] font-bold text-red-600 font-sans leading-tight italic">
                        Este documento es una representación electrónica del pase oficial emitido por la Marina Mercante de Honduras. 
                        Cualquier alteración anula su validez.
                    </p>
                    <p className="text-[8px] text-neutral-400 mt-2 font-sans">
                        Emitido por: Sistema de Gestión Marítima Digitalacma • {mounted ? new Date().toLocaleString('es-HN') : ''} • ID: {pase.id}
                    </p>
                </div>
            </div>
        </div>
    );
}
