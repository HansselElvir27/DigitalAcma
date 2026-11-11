"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Award, ShieldCheck, Printer, Calendar, User, MapPin, Hash, CheckCircle2 } from "lucide-react";

export interface PatronCarnetData {
    id: string;
    carnetNumber: string;
    tituloNumero: string;
    nombres: string;
    apellidos: string;
    nacionalidad: string;
    identidad: string;
    fotografia?: string | null;
    capacidadRestan: string;
    puertoRegistro: string;
    emision: string | Date;
    expiracion: string | Date;
    leyenda?: string | null;
    status: string;
    captainSignature?: string | null;
    port?: { name: string } | null;
    captain?: { name?: string | null } | null;
}

interface PatronLanchaCarnetDocumentProps {
    carnet: PatronCarnetData;
    showPrintButton?: boolean;
}

export function PatronLanchaCarnetDocument({ carnet, showPrintButton = true }: PatronLanchaCarnetDocumentProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://acma.dgmm.gob.hn";
    const verifyUrl = `${baseUrl}/verificar/patron/${carnet.id}`;

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return "-";
        const d = new Date(date);
        return d.toLocaleDateString("es-HN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto my-6">
            {showPrintButton && (
                <div className="w-full flex justify-end gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="premium-gradient text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
                    >
                        <Printer size={16} /> Imprimir Carnet (Frente y Reverso)
                    </button>
                </div>
            )}

            {/* Print Container: Tarjeta estilo carnet ID-1 / Licencia Náutica */}
            <div className="grid md:grid-cols-2 gap-8 w-full print:grid-cols-1 print:gap-12 text-slate-900">
                {/* LADO FRONTAL */}
                <div className="bg-gradient-to-br from-amber-50 via-white to-sky-50 border-2 border-amber-600/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px] print:shadow-none print:border-2 print:border-black">
                    {/* Marca de agua escudo DGMM */}
                    <img
                        src="/dgmm-seal-official.png"
                        alt="Escudo Oficial"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.08] pointer-events-none object-contain"
                    />

                    {/* Cabecera */}
                    <div>
                        <div className="flex items-center gap-3 border-b-2 border-amber-600/30 pb-3">
                            <img src="/dgmm-seal-official.png" alt="DGMM" className="w-14 h-14 object-contain drop-shadow" />
                            <div className="leading-tight">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">República de Honduras</p>
                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">Dirección General de la Marina Mercante</p>
                                <h2 className="text-sm font-black text-amber-700 uppercase tracking-tight">PATRÓN DE LANCHA COSTERAS</h2>
                            </div>
                        </div>

                        {/* Contenido Frontal: Foto y Datos */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {/* Fotografía tamaño carnet */}
                            <div className="col-span-1 flex flex-col items-center">
                                <div className="w-28 h-36 bg-slate-200 border-2 border-slate-400 rounded-xl overflow-hidden shadow-md flex items-center justify-center relative">
                                    {carnet.fotografia ? (
                                        <img
                                            src={carnet.fotografia}
                                            alt="Fotografía Carnet"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-2 text-slate-400">
                                            <User size={36} className="mx-auto mb-1 opacity-50" />
                                            <span className="text-[9px] font-semibold">FOTO CARNET</span>
                                        </div>
                                    )}
                                </div>
                                <span className="mt-2 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-500/30">
                                    {carnet.status || "VIGENTE"}
                                </span>
                            </div>

                            {/* Datos del Lanchero */}
                            <div className="col-span-2 space-y-2 text-xs">
                                <div>
                                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">TÍTULO NÚMERO</span>
                                    <span className="font-mono font-bold text-sm text-amber-800 tracking-wider">{carnet.tituloNumero}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">NOMBRES Y APELLIDOS</span>
                                    <span className="font-bold text-sm uppercase text-slate-900 block leading-tight">
                                        {carnet.nombres} {carnet.apellidos}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">IDENTIDAD</span>
                                        <span className="font-mono font-semibold text-slate-800">{carnet.identidad}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">NACIONALIDAD</span>
                                        <span className="font-semibold uppercase text-slate-800">{carnet.nacionalidad || "HONDUREÑA"}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">PUERTO DE REGISTRO</span>
                                    <span className="font-bold uppercase text-slate-800">{carnet.puertoRegistro || carnet.port?.name || "TELA"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pie Frontal */}
                    <div className="mt-4 pt-3 border-t border-slate-300/80 flex justify-between items-end text-[10px]">
                        <div>
                            <span className="text-slate-500 text-[8px] font-bold block uppercase">CAPITANÍA EMISORA</span>
                            <span className="font-bold uppercase text-slate-800">{carnet.port?.name || carnet.puertoRegistro}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[8px] font-black text-amber-800 tracking-widest uppercase">CARNET OFICIAL DGMM</span>
                        </div>
                    </div>
                </div>

                {/* LADO REVERSO */}
                <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50 border-2 border-amber-600/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px] print:shadow-none print:border-2 print:border-black">
                    <div>
                        {/* Cabecera Reverso */}
                        <div className="flex justify-between items-center border-b border-slate-300 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">AUTORIZACIÓN Y RESTRICCIONES</span>
                            <span className="text-[9px] font-bold text-amber-700 uppercase">ACUERDO DGMM 002 DEL AÑO 2000</span>
                        </div>

                        {/* Leyenda Oficial Obligatoria */}
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-600/30 rounded-xl text-[10.5px] leading-relaxed text-slate-800 font-medium text-justify">
                            "El portador de éste carnet está autorizado por la Dirección General de la Marina Mercante a gobernar embarcaciones a motor y/o vela con una Capacida no mayor de la especificada en la parte posterior del mismo, en las zonas comprendidas entre la costa nacional y una línea paralela a la misma trazada a 12 millas náuticas así como la navegación Interinsular."
                            <span className="block mt-1 font-bold text-[9.5px] text-amber-900">
                                Esto en virtud de lo dispuesto en el acuerdo de DGMM 002 del año 2000.
                            </span>
                        </div>

                        {/* Especificaciones de Capacidad y Fechas */}
                        <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-slate-100 rounded-xl text-center">
                            <div>
                                <span className="text-[8px] uppercase font-black text-slate-500 block">CAPACIDAD HASTA</span>
                                <span className="font-black text-xs text-amber-800 uppercase">{carnet.capacidadRestan || "5 TONELADAS"}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase font-black text-slate-500 block">EMISIÓN</span>
                                <span className="font-bold text-xs text-slate-800">{formatDate(carnet.emision)}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase font-black text-slate-500 block">EXPIRACIÓN</span>
                                <span className="font-bold text-xs text-red-700">{formatDate(carnet.expiracion)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sello Redondo Oficial + QR + Firma */}
                    <div className="mt-4 pt-3 border-t-2 border-slate-300 grid grid-cols-3 items-center gap-2">
                        {/* QR Verificación */}
                        <div className="flex flex-col items-center">
                            {mounted && (
                                <a href={verifyUrl} target="_blank" rel="noreferrer" title="Escanear para verificar">
                                    <QRCodeSVG value={verifyUrl} size={65} level="M" />
                                </a>
                            )}
                            <span className="text-[7.5px] font-bold text-slate-500 mt-1 uppercase">Escanear para verificar</span>
                        </div>

                        {/* Sello Redondo Oficial de la Marina Mercante */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-2 border-blue-800/80 p-0.5 flex items-center justify-center relative">
                                <img
                                    src="/dgmm-seal-official.png"
                                    alt="Sello Redondo Oficial"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-[7.5px] font-black text-blue-900 uppercase mt-0.5 tracking-tight text-center">
                                Sello Oficial DGMM
                            </span>
                        </div>

                        {/* Firma Capitanía */}
                        <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-full border-b border-slate-700 flex items-center justify-center">
                                {carnet.captainSignature ? (
                                    <img src={carnet.captainSignature} alt="Firma Autorizada" className="max-h-11 object-contain" />
                                ) : (
                                    <span className="text-[8px] italic font-serif text-slate-400">Firma Autorizada</span>
                                )}
                            </div>
                            <span className="text-[8px] font-black uppercase text-slate-800 mt-1">Capitán de Puerto</span>
                            <span className="text-[7px] text-slate-500 uppercase">{carnet.captain?.name || "Autoridad Marítima"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

