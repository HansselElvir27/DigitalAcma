"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Ship, Anchor, MapPin, Calendar, Clock, CheckCircle, ShieldCheck, PenTool, Radio } from "lucide-react";
import { PrintPDFButton } from "./PrintPDFButton";

interface ZarpeData {
    id: string;
    vesselName: string;
    registrationNum: string;
    captainName: string;
    departureDate: Date | string;
    departureTime?: string;
    destination: string;
    port: { name: string };
    user?: { email: string | null };
    signature?: string | null;
    omiNumber?: string | null;
    flag?: string | null;
    owner?: string | null;
    eslora?: string | null;
    manga?: string | null;
    puntal?: string | null;
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
    captainSignature?: string | null;
    createdAt: Date | string;
}

interface ZarpeDocumentProps {
    zarpe: ZarpeData;
    showPrintButton?: boolean;
    showDownloadButton?: boolean;
}

export function ZarpeDocument({ zarpe, showPrintButton = true, showDownloadButton = true }: ZarpeDocumentProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Official Verification URL - Stable for SSR
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verificar/${zarpe.id}`;

    // Official Zarpe Number - Prefer database value, fallback to generation
    const createdDate = new Date(zarpe.createdAt);
    const generatedNumber = `${createdDate.getFullYear()}-DGMM-ZARPNAC-${zarpe.port.name.substring(0, 3).toUpperCase()}-${zarpe.id.substring(0, 5).toUpperCase()}`;
    const zarpeNumber = zarpe.zarpeNumber || generatedNumber;

    // Stable Date Formatting
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
        <div className="bg-white p-12 print:p-8 w-full border border-neutral-200 print:border-none relative font-serif text-neutral-900 overflow-y-auto">
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

                {/* Center: Logos and Institutional Name */}
                <div className="flex flex-col items-center flex-1 px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <img src="/dgmm-seal-official.png" alt="Sello Marina Mercante" className="h-32 w-auto" />
                    </div>
                    
                    <h1 className="text-lg font-black text-neutral-800 tracking-tight mb-4 text-center font-sans uppercase">
                        DIRECCIÓN GENERAL DE LA MARINA MERCANTE DE HONDURAS
                    </h1>

                    <h2 className="text-2xl font-black text-neutral-800 tracking-tight mb-1 text-center font-sans uppercase">
                        {zarpeNumber}
                    </h2>
                </div>

                {/* Right: Doc Code & Action */}
                <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-[10px] font-bold text-neutral-400 font-sans">CP.R.35</p>
                    {showDownloadButton && mounted && (
                        <div className="print:hidden">
                            <PrintPDFButton zarpe={zarpe as any} downloadOnly label="Descargar PDF" />
                        </div>
                    )}
                </div>
            </div>

            {/* Section I: GENERALIDADES DE LA NAVE */}
            <section className="mb-6">
                <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-3 uppercase tracking-wide">
                    GENERALIDADES DE LA NAVE -|- GENERAL SHIP&apos;S DATA
                </h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Registro Oficial</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.registrationNum}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">OMI</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.omiNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Nombre de la Embarcación</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase font-bold">{zarpe.vesselName}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Número de Baliza</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.balizaNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Patente</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.patent || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Certificado de Navegabilidad</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.navegabilityCert || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Rubro</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.rubro || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Licencia DIGEPESCA</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.digepescaLicense || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Bandera</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.flag || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Propietario</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.owner || '-'}</span>
                    </div>
                </div>
            </section>

            {/* Section II: CARACTERISTICAS PRINCIPALES */}
            <section className="mb-6">
                <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-3 uppercase tracking-wide">
                    CARACTERISTICAS PRINCIPALES -|- MAIN PARTICULARS
                </h3>
                <div className="grid grid-cols-3 gap-x-12 gap-y-3">
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Eslora</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.eslora || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Manga</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.manga || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Puntal</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.puntal || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">TBR</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.tbr || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">TNR</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.tnr || '-'}</span>
                    </div>
                </div>
            </section>

            {/* Section III: DATOS DEL ZARPE */}
            <section className="mb-6">
                <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-3 uppercase tracking-wide">
                    DATOS DEL ZARPE -|- PORT CLEARANCE DATA
                </h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                    <div className="col-span-2 flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Consignado</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.consignee || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Puerto de Zarpe</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.port.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Frecuencia de Radio</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.radioFrequency || '6548.5'}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Fecha de Salida</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">
                            {formatFullDate(zarpe.departureDate)}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Destino</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase font-bold text-blue-900">{zarpe.destination}</span>
                    </div>
                    <div className="col-span-2 flex justify-between border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Email de Contacto</span>
                        <span className="text-[10px] text-neutral-900 font-medium">{zarpe.user?.email || '-'}</span>
                    </div>
                    <div className="col-span-2 flex flex-col pt-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase mb-1">Lleva Abordo</span>
                        <p className="text-[10px] text-neutral-900 uppercase leading-relaxed bg-neutral-50 p-2 border border-dotted border-neutral-200">
                            {zarpe.carriesOnBoard || 'EN LASTRE'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Section IV: TRIPULACIÓN Y PASAJEROS */}
            <section className="mb-12">
                <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-3 uppercase tracking-wide">
                    TRIPULACIÓN Y PASAJEROS -|- CREW AND PASSENGERS
                </h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-4">
                    <div className="flex flex-col gap-1 border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Nombre Capitán</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.captainName}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Licencia Capitán</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.captainLicense || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Nombre Primer Oficial</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.firstOfficerName || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-neutral-100 pb-1">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase">Licencia Primer Oficial</span>
                        <span className="text-[10px] text-neutral-900 font-medium uppercase">{zarpe.firstOfficerLicense || '-'}</span>
                    </div>
                </div>
                
                <div className="mt-4">
                    <span className="text-[10px] font-bold text-neutral-700 uppercase block mb-2">Lista de Tripulantes</span>
                    <div className="text-[9px] text-neutral-600 font-mono whitespace-pre-wrap leading-tight bg-neutral-50/50 p-3 rounded border border-neutral-100">
                        {zarpe.crewList ? zarpe.crewList.split('\n').map((line, idx) => (
                            <div key={idx} className="mb-0.5">
                                {line.match(/^\d/) ? line : `${idx + 1}- ${line}`}
                            </div>
                        )) : 'No hay tripulantes adicionales registrados.'}
                    </div>
                </div>
            </section>

            {/* Footer and Signatures */}
            <div className="mt-auto pt-12">
                <div className="flex justify-between items-end border-t border-neutral-100 pt-8">
                    <div className="flex flex-col items-center w-64">
                        <div className="w-full h-16 flex items-center justify-center border-b border-neutral-300 mb-2 relative">
                            {zarpe.signature ? (
                                <div className="bg-slate-100 p-2 rounded">
                                    <img src={zarpe.signature?.startsWith('/uploads/') ? `/api${zarpe.signature}` : zarpe.signature} alt="Firma Solicitante" className="max-h-14 opacity-95" />
                                </div>
                            ) : (
                                <div className="text-[8px] text-neutral-300 absolute">Pendiente de Firma</div>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-neutral-700 uppercase font-sans">Firma Responsable - Requesting Signature</p>
                    </div>

                    <div className="flex flex-col items-center w-64">
                        <div className="w-full flex items-center justify-center mb-2 relative min-h-[64px]">
                            {zarpe.captainSignature ? (
                                <div className="flex flex-col items-center relative py-2 w-full">
                                    <div className="absolute inset-0 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-900/20" />
                                    <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-center gap-2">
                                            <img src="/dgmm-seal-official.png" alt="Sello DGMM" className="h-8 w-8 opacity-80 mix-blend-multiply" />
                                            <div className="flex flex-col">
                                                <span className="text-blue-900 text-[6px] font-black uppercase tracking-widest text-left">Firma Electrónica Autorizada</span>
                                                <span className="text-blue-700 text-[5px] font-mono text-left">VERIFICADA: {formatDate(zarpe.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[8px] text-neutral-300 absolute py-6">Pendiente Aprobación Capitán</div>
                            )}
                        </div>
                        <div className="border-t border-neutral-300 w-full mb-1"></div>
                        <p className="text-[10px] font-bold text-blue-900 uppercase font-sans">Capitán de Puerto - Port Captain</p>
                    </div>
                </div>

                <div className="mt-12 text-center border-t border-neutral-100 pt-3">
                    <p className="text-[10px] font-bold text-red-600 font-sans leading-tight">
                        This is an electronic representation of the official document that will be in force once signed by the port member authority of Honduras.
                    </p>
                    <p className="text-[8px] text-neutral-400 mt-2 font-sans">
                        Emitido electrónicamente por el Sistema de Gestión Marítima Digitalacma • {mounted ? new Date().toLocaleString('es-HN') : ''}
                    </p>
                </div>
            </div>

        </div>
    );
}
