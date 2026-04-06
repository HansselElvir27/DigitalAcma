"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Ship, Anchor, MapPin, Calendar, Clock, CheckCircle, ShieldCheck, PenTool, Radio, User, Smartphone, Info } from "lucide-react";
import { PrintVesselPDFButton } from "./PrintVesselPDFButton";

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
    engineSerials?: any; // JSON
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
    captainSignature?: string | null;
    qrCode?: string | null;
    port: { name: string };
    captain?: { name: string | null } | null;
    createdAt: Date | string;
}

interface VesselPermitDocumentProps {
    vessel: VesselData;
    showPrintButton?: boolean;
}

export function VesselPermitDocument({ vessel, showPrintButton = true }: VesselPermitDocumentProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verificar/vessel/${vessel.id}`;

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "-";
        const d = new Date(date);
        return d.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const engineSerialsArr = Array.isArray(vessel.engineSerials) ? vessel.engineSerials : [];

    return (
        <div className="bg-white p-12 print:p-8 w-full border border-neutral-200 print:border-none relative font-serif text-neutral-900 overflow-y-auto min-h-screen flex flex-col">
            {/* Header Layout */}
            <div className="flex justify-between items-start mb-8">
                {/* Left: QR Code */}
                <div className="flex flex-col items-center min-w-[110px]">
                    {mounted ? (
                        <a 
                            href={verifyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-105 active:scale-95 group relative"
                        >
                            <QRCodeSVG value={verifyUrl} size={110} level="H" />
                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded" />
                        </a>
                    ) : (
                        <div className="w-[110px] h-[110px] bg-neutral-100 animate-pulse rounded" />
                    )}
                    <p className="text-[9px] mt-2 text-neutral-500 font-sans uppercase">Verificación Electrónica</p>
                </div>

                {/* Center: Logos and Institutional Name */}
                <div className="flex flex-col items-center flex-1 px-4">
                    <img src="/dgmm-seal-official.png" alt="Sello Marina Mercante" className="h-32 mb-4" />
                    <h1 className="text-lg font-black text-neutral-800 tracking-tight text-center font-sans uppercase">
                        DIRECCIÓN GENERAL DE LA MARINA MERCANTE DE HONDURAS
                    </h1>
                    <h2 className="text-2xl font-black text-blue-900 tracking-tight mt-2 text-center font-sans uppercase">
                        PERMISO DE NAVEGACIÓN
                    </h2>
                    <p className="text-xl font-mono font-bold text-red-600 mt-2">{vessel.registrationNumber}</p>
                </div>

                {/* Right: Doc Code & Action */}
                <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-[10px] font-bold text-neutral-400 font-sans uppercase tracking-widest">REG-NAV-V1</p>
                    {showPrintButton && mounted && (
                        <div className="print:hidden">
                            <PrintVesselPDFButton vessel={vessel as any} />
                        </div>
                    )}
                </div>
            </div>

            {/* Vessel Data Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                
                {/* Section I: Datos de la Embarcación */}
                <section>
                    <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Ship size={14} /> Datos de la Embarcación
                    </h3>
                    <div className="space-y-2.5">
                        <DataField label="Nombre de Embarcación" value={vessel.vesselName} bold />
                        <DataField label="Tipo" value={vessel.vesselType} />
                        <DataField label="Actividad" value={vessel.activityType} />
                        <DataField label="Año de Construcción" value={vessel.yearBuilt} />
                        <DataField label="Material del Casco" value={vessel.hullMaterial} />
                        <DataField label="Color" value={vessel.color} />
                        <DataField label="Ruta de Navegación" value={vessel.route} />
                    </div>
                </section>

                {/* Section II: Características Técnicas */}
                <section>
                    <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Anchor size={14} /> Características Técnicas
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 space-y-0.5">
                        <DataField label="Eslora" value={vessel.eslora} />
                        <DataField label="Manga" value={vessel.manga} />
                        <DataField label="Punta" value={vessel.punta} />
                        <DataField label="Calado" value={vessel.calado} />
                        <DataField label="Tonelaje Bruto (TBR)" value={vessel.grossTonnage} />
                        <DataField label="Tonelaje Neto (TNR)" value={vessel.netTonnage} />
                        <DataField label="Capacidad Pasajeros" value={vessel.passengerCapacity} />
                        <DataField label="Capacidad Tripulación" value={vessel.crewCapacity} />
                    </div>
                </section>

                {/* Section III: Información del Motor */}
                <section>
                    <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Radio size={14} /> Planta Propulsora
                    </h3>
                    <div className="space-y-2.5">
                        <DataField label="Marca de Motor" value={vessel.engineBrand} />
                        <div className="flex flex-col gap-1 border-b border-neutral-100 pb-1">
                            <span className="text-[9px] font-bold text-neutral-500 uppercase">Series de Motores</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {engineSerialsArr.length > 0 ? engineSerialsArr.map((s: string, i: number) => (
                                    <span key={i} className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded font-mono font-bold">{s}</span>
                                )) : <span className="text-[10px] text-neutral-400 italic">No registradas</span>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section IV: Información del Propietario */}
                <section>
                    <h3 className="text-[11px] font-bold text-blue-900 border-b-2 border-blue-900 pb-0.5 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <User size={14} /> Datos del Propietario
                    </h3>
                    <div className="space-y-2.5">
                        <DataField label="Nombre del Propietario" value={vessel.ownerName} bold />
                        <DataField label="Identidad" value={vessel.ownerId} />
                        <DataField label="RTN" value={vessel.rtn} />
                        <DataField label="Teléfono" value={vessel.phone} />
                    </div>
                </section>
            </div>

            {/* Vigencia y Observaciones */}
            <div className="mt-8 border-t border-blue-900/10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center gap-4">
                    <div className="flex justify-between items-center text-blue-900">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span className="text-[10px] font-bold uppercase">Fecha de Emisión</span>
                        </div>
                        <span className="text-sm font-black italic">{formatDate(vessel.issueDate)}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-700">
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span className="text-[10px] font-bold uppercase">Fecha de Expiración</span>
                        </div>
                        <span className="text-sm font-black italic">{formatDate(vessel.expirationDate)}</span>
                    </div>
                </div>
                <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-800 mb-2">
                        <Info size={14} />
                        <span className="text-[10px] font-bold uppercase">Observaciones</span>
                    </div>
                    <p className="text-[10px] leading-relaxed italic text-neutral-600">
                        {vessel.observations || "Sin observaciones adicionales."}
                    </p>
                </div>
            </div>

            {/* Footer and Signatures */}
            <div className="mt-auto pt-16">
                <div className="flex justify-center items-end">
                    <div className="flex flex-col items-center w-80">
                        <div className="w-full h-20 flex items-center justify-center border-b border-neutral-300 mb-2 relative">
                            {vessel.captainSignature ? (
                                <img src={vessel.captainSignature} alt="Firma Capitán" className="max-h-16" />
                            ) : (
                                <div className="text-[20px] font-serif italic text-neutral-800 opacity-60">
                                    {vessel.captain?.name || "Capitán de Puerto"}
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-blue-900 uppercase font-sans">Capitán de Puerto Digital - {vessel.port.name}</p>
                        <p className="text-[8px] text-neutral-400 font-sans tracking-widest uppercase">Dirección General de la Marina Mercante</p>
                    </div>
                </div>

                <div className="mt-12 text-center border-t border-neutral-100 pt-4">
                    <p className="text-[9px] font-bold text-neutral-400 font-sans leading-tight italic uppercase tracking-wider">
                        Documento oficial generado electrónicamente por el Sistema Digitalacma • Honduras
                    </p>
                </div>
            </div>
        </div>
    );
}

function DataField({ label, value, bold = false }: { label: string, value: any, bold?: boolean }) {
    return (
        <div className="flex justify-between border-b border-neutral-100 pb-1">
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tight">{label}</span>
            <span className={`text-[10px] text-neutral-900 uppercase ${bold ? 'font-black italic' : 'font-medium'}`}>
                {value || "-"}
            </span>
        </div>
    );
}
