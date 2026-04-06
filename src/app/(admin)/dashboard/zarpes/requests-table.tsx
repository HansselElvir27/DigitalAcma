"use client";

import { useState } from "react";
import { Clock, CheckCircle, AlertCircle, Eye, X, Check, Anchor, Ship, MapPin, PenTool, FileText, Download, User, Briefcase, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function ZarpesTable({ requests, userRole }: { requests: any[], userRole: string }) {
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [cimCommentInput, setCimCommentInput] = useState("");
    const [activeTab, setActiveTab] = useState<'datos' | 'documentos'>('datos');
    const [rejectionMode, setRejectionMode] = useState(false);
    const [rejectionComment, setRejectionComment] = useState("");
    const router = useRouter();

    const updateStatus = async (id: string, status: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    type: "ZARPE",
                    cimComment: status === "PRE_APPROVED"
                        ? cimCommentInput
                        : status === "REJECTED"
                        ? rejectionComment
                        : undefined
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error en servidor");
            }

            router.refresh();
            setSelectedReq(null);
            setCimCommentInput("");
            setRejectionComment("");
            setRejectionMode(false);
        } catch (error: any) {
            console.error("Failed to update status", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Módulo / ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Buque / Matrícula</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Zarpe Solicitado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto / Destino</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center opacity-40 text-sm">No hay solicitudes de zarpe registradas</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedReq(req)}>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm tracking-tight">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] opacity-40 font-mono tracking-tighter">{req.id.slice(-8).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm flex items-center gap-2">
                                                <Anchor size={14} className="opacity-40" /> {req.vesselName}
                                            </p>
                                            <p className="text-[10px] opacity-60 font-mono mt-1">{req.registrationNum}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-brand-secondary">{new Date(req.departureDate).toLocaleDateString()}</p>
                                            <p className="text-xs opacity-60">{new Date(req.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{req.port?.name || "Desconocido"}</p>
                                            <p className="text-xs opacity-60">➡ {req.destination}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                req.status === 'REVIEWING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    req.status === 'PRE_APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                        req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {req.status === 'PENDING' && <AlertCircle size={12} />}
                                                {req.status === 'REVIEWING' && <Clock size={12} />}
                                                {req.status === 'PRE_APPROVED' && <Check size={12} className="text-indigo-400" />}
                                                {req.status === 'APPROVED' && <CheckCircle size={12} />}
                                                {req.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-secondary transition-colors opacity-0 group-hover:opacity-100">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalles */}
            <AnimatePresence>
                {selectedReq && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-brand-primary w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between premium-gradient">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                    <Ship size={20} /> Solicitud de Zarpe Nacional
                                </h3>
                                <button onClick={() => setSelectedReq(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setActiveTab('datos')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                        activeTab === 'datos' 
                                            ? 'bg-brand-secondary text-white' 
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                                >
                                    <User size={14} className="inline mr-2" />
                                    Datos Completos
                                </button>
                                <button
                                    onClick={() => setActiveTab('documentos')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                        activeTab === 'documentos' 
                                            ? 'bg-brand-secondary text-white' 
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                                >
                                    <FileText size={14} className="inline mr-2" />
                                    Documentos Adjuntos
                                </button>
                            </div>

                            {/* Body */}
                            <div className="space-y-6 overflow-y-auto">
                                {activeTab === 'datos' ? (
                                    <>
                                        {/* Datos del Solicitante */}
                                        <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Solicitante</p>
                                                <p className="font-bold text-sm">{selectedReq.captainName}</p>
                                                <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                                                    {selectedReq.user?.email}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">ID de Documento</p>
                                                <p className="font-mono text-sm opacity-80">{selectedReq.id}</p>
                                                <p className="text-xs opacity-60">Creado: {new Date(selectedReq.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Datos de la Embarcación */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                                <Anchor size={16} className="text-brand-secondary" /> Datos de la Embarcación
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre del Buque</p>
                                                    <p className="font-bold">{selectedReq.vesselName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Matrícula</p>
                                                    <p className="font-bold font-mono">{selectedReq.registrationNum}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Número OMI</p>
                                                    <p className="font-bold">{selectedReq.omiNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Bandera</p>
                                                    <p className="font-bold">{selectedReq.flag || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Propietario</p>
                                                    <p className="font-bold">{selectedReq.owner || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Dimensión</p>
                                                    <p className="font-bold">{selectedReq.dimension || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">TBR</p>
                                                    <p className="font-bold">{selectedReq.tbr || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">TNR</p>
                                                    <p className="font-bold">{selectedReq.tnr || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Rubro</p>
                                                    <p className="font-bold">{selectedReq.rubro || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Número de Baliza</p>
                                                    <p className="font-bold">{selectedReq.balizaNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Patente</p>
                                                    <p className="font-bold">{selectedReq.patent || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Certificado de Navegabilidad</p>
                                                    <p className="font-bold">{selectedReq.navegabilityCert || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Consignatario y Licencias */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                                <Briefcase size={16} className="text-brand-secondary" /> Consignatario y Licencias
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Consignado</p>
                                                    <p className="font-bold">{selectedReq.consignee || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Licencia DIGEPESCA</p>
                                                    <p className="font-bold">{selectedReq.digepescaLicense || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Frecuencia de Radio</p>
                                                    <p className="font-bold">{selectedReq.radioFrequency || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tripulación */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                                <User size={16} className="text-brand-secondary" /> Tripulación
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre del Capitán</p>
                                                    <p className="font-bold">{selectedReq.captainName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Licencia Capitán</p>
                                                    <p className="font-bold">{selectedReq.captainLicense || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre Primer Oficial</p>
                                                    <p className="font-bold">{selectedReq.firstOfficerName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Licencia Primer Oficial</p>
                                                    <p className="font-bold">{selectedReq.firstOfficerLicense || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Lista de Tripulantes</p>
                                                <div className="bg-white/5 rounded-xl p-4 text-sm max-h-32 overflow-y-auto">
                                                    {selectedReq.crewList || 'No especificada'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Carga */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                                <ClipboardCheck size={16} className="text-brand-secondary" /> Carga
                                            </h4>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Lleva a Bordo</p>
                                                <div className="bg-white/5 rounded-xl p-4 text-sm">
                                                    {selectedReq.carriesOnBoard || 'No especificado'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detalles del Viaje */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                                <MapPin size={16} className="text-brand-secondary" /> Detalles del Viaje
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Puerto de Origen</p>
                                                    <p className="font-bold">{selectedReq.port?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Puerto de Destino</p>
                                                    <p className="font-bold">{selectedReq.destination || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Fecha de Zarpe</p>
                                                    <p className="font-bold">
                                                        {selectedReq.departureDate 
                                                            ? new Date(selectedReq.departureDate).toLocaleDateString() 
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Hora de Zarpe</p>
                                                    <p className="font-bold">
                                                        {selectedReq.departureDate 
                                                            ? new Date(selectedReq.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Firma */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                                <PenTool size={16} className="text-brand-secondary" /> Firma del Capitán / Propietario
                                            </h4>
                                            {selectedReq.signature ? (
                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex justify-center">
                                                    <img src={selectedReq.signature} alt="Firma Digital" className="max-h-32 opacity-90 object-contain" />
                                                </div>
                                            ) : (
                                                <div className="h-32 bg-white/5 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
                                                    <p className="text-xs opacity-40 italic">No se registró firma digital</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Comentario CIM */}
                                        {selectedReq.cimComment && (
                                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Observación de CIM</p>
                                                <p className="text-sm italic">"{selectedReq.cimComment}"</p>
                                            </div>
                                        )}

                                        {/* Formulario de Pre-aprobación CIM */}
                                        {userRole === "CIM" && selectedReq.status === "PENDING" && (
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Agregar Observación para Capitanía</label>
                                                <textarea
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none h-24"
                                                    placeholder="Ej: Documentos verificados, embarcación apta para zarpe..."
                                                    value={cimCommentInput}
                                                    onChange={(e) => setCimCommentInput(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Documentos Adjuntos Tab */
                                    <div className="space-y-6">
                                        {/* Manifiesto de Carga */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <FileText size={16} className="text-brand-secondary" /> Manifiesto de Carga
                                            </h4>
                                            {selectedReq.carriesOnBoardAttachment ? (
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={24} className="text-brand-secondary" />
                                                            <div>
                                                                <p className="font-bold text-sm">Archivo adjunto</p>
                                                                <p className="text-xs opacity-60">Manifiesto de carga de la embarcación</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={selectedReq.carriesOnBoardAttachment} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 transition-colors"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                    <div className="mt-3 bg-white/5 rounded-lg p-2 max-h-48 overflow-hidden">
                                                        <img 
                                                            src={selectedReq.carriesOnBoardAttachment} 
                                                            alt="Manifiesto de Carga" 
                                                            className="w-full h-auto object-contain rounded"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10 text-center opacity-50">
                                                    <FileText size={24} className="mx-auto mb-2 opacity-40" />
                                                    <p className="text-xs">No hay archivo adjunto</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lista de Tripulantes */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <User size={16} className="text-brand-secondary" /> Lista de Tripulantes
                                            </h4>
                                            {selectedReq.crewListFile ? (
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={24} className="text-brand-secondary" />
                                                            <div>
                                                                <p className="font-bold text-sm">Archivo adjunto</p>
                                                                <p className="text-xs opacity-60">Lista de tripulantes registrados</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={selectedReq.crewListFile} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 transition-colors"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                    <div className="mt-3 bg-white/5 rounded-lg p-2 max-h-48 overflow-hidden">
                                                        <img 
                                                            src={selectedReq.crewListFile} 
                                                            alt="Lista de Tripulantes" 
                                                            className="w-full h-auto object-contain rounded"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10 text-center opacity-50">
                                                    <User size={24} className="mx-auto mb-2 opacity-40" />
                                                    <p className="text-xs">No hay archivo adjunto</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lista de Pasajeros */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <User size={16} className="text-brand-secondary" /> Lista de Pasajeros
                                            </h4>
                                            {selectedReq.passengerListFile ? (
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={24} className="text-brand-secondary" />
                                                            <div>
                                                                <p className="font-bold text-sm">Archivo adjunto</p>
                                                                <p className="text-xs opacity-60">Lista de pasajeros (si aplica)</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={selectedReq.passengerListFile} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 transition-colors"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                    <div className="mt-3 bg-white/5 rounded-lg p-2 max-h-48 overflow-hidden">
                                                        <img 
                                                            src={selectedReq.passengerListFile} 
                                                            alt="Lista de Pasajeros" 
                                                            className="w-full h-auto object-contain rounded"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10 text-center opacity-50">
                                                    <User size={24} className="mx-auto mb-2 opacity-40" />
                                                    <p className="text-xs">No hay archivo adjunto</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Factura de Pago */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <FileText size={16} className="text-brand-secondary" /> Factura de Pago
                                            </h4>
                                            {selectedReq.paymentReceiptFile ? (
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={24} className="text-brand-secondary" />
                                                            <div>
                                                                <p className="font-bold text-sm">Archivo adjunto</p>
                                                                <p className="text-xs opacity-60">Recibo de pago de tasas marítimas</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={selectedReq.paymentReceiptFile} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 transition-colors"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                    <div className="mt-3 bg-white/5 rounded-lg p-2 max-h-48 overflow-hidden">
                                                        <img 
                                                            src={selectedReq.paymentReceiptFile} 
                                                            alt="Factura de Pago" 
                                                            className="w-full h-auto object-contain rounded"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10 text-center opacity-50">
                                                    <FileText size={24} className="mx-auto mb-2 opacity-40" />
                                                    <p className="text-xs">No hay archivo adjunto</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions / Footer */}
                            <div className="p-6 border-t border-white/10 bg-black/20 mt-auto">
                                {/* Rejection confirmation area */}
                                {rejectionMode ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Motivo del Rechazo</p>
                                            <textarea
                                                rows={3}
                                                value={rejectionComment}
                                                onChange={(e) => setRejectionComment(e.target.value)}
                                                placeholder="Indique el motivo del rechazo (requerido)..."
                                                className="w-full bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none resize-none text-white placeholder-white/30"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setRejectionMode(false); setRejectionComment(""); }}
                                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                disabled={loading || !rejectionComment.trim()}
                                                onClick={() => updateStatus(selectedReq.id, 'REJECTED')}
                                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
                                            >
                                                Confirmar Rechazo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-3">
                                        {selectedReq.status !== 'REJECTED' && selectedReq.status !== 'APPROVED' && (
                                            <button
                                                disabled={loading}
                                                onClick={() => setRejectionMode(true)}
                                                className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                            >
                                                Rechazar
                                            </button>
                                        )}

                                        {userRole === "CIM" && selectedReq.status === "PENDING" && (
                                            <button
                                                disabled={loading || !cimCommentInput.trim()}
                                                onClick={() => updateStatus(selectedReq.id, 'PRE_APPROVED')}
                                                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Check size={16} /> Pre-Aprobar Zarpe
                                            </button>
                                        )}

                                        {(userRole === "CAPITAN" || userRole === "ADMIN") && selectedReq.status === "PRE_APPROVED" && (
                                            <button
                                                disabled={loading}
                                                onClick={() => updateStatus(selectedReq.id, 'APPROVED')}
                                                className="px-6 py-2.5 rounded-xl bg-brand-secondary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Check size={16} /> Autorizar Zarpe
                                            </button>
                                        )}

                                        {selectedReq.status === "APPROVED" && (
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase border border-green-500/30 text-center">
                                                    Zarpe Autorizado
                                                </div>
                                                <a
                                                    href={`/zarpe/${selectedReq.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-6 py-2.5 rounded-xl bg-brand-primary text-brand-secondary border border-brand-secondary font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Ship size={16} /> Ver Documento Oficial
                                                </a>
                                            </div>
                                        )}

                                        {selectedReq.status === "REJECTED" && (
                                            <div className="px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                                                Zarpe Rechazado
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
