"use client";

import { useState, useEffect } from "react";
import { Satellite } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, AlertCircle, Eye, X, Check, Anchor, Ship, MapPin, PenTool, FileText, User, Mail, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

interface BalizaRequest {
    id: string;
    fechaHora: Date;
    nombreSolicitante: string;
    condicion: string;
    correo: string;
    nombreEmbarcacion: string;
    numeroRegistro: string;
    capitaniaPuerto: string;
    motivo: string;
    signature: string | null;
    status: string;
    cimComment: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

function BalizaTable({ requests, userRole, onRefresh }: { requests: BalizaRequest[], userRole: string, onRefresh: () => void }) {
    const [selectedReq, setSelectedReq] = useState<BalizaRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [cimCommentInput, setCimCommentInput] = useState("");
    const router = useRouter();

    const updateStatus = async (id: string, status: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    type: "BALIZA_DESACTIVACION",
                    cimComment: cimCommentInput || undefined
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error en servidor");
            }

            router.refresh();
            setSelectedReq(null);
            setCimCommentInput("");
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
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha / ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Solicitante</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Embarcación / Registro</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Condición</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center opacity-40 text-sm">No hay solicitudes de desactivación de baliza</td>
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
                                                <User size={14} className="opacity-40" /> {req.nombreSolicitante}
                                            </p>
                                            <p className="text-[10px] opacity-60 font-mono mt-1">{req.correo}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm flex items-center gap-2">
                                                <Anchor size={14} className="opacity-40" /> {req.nombreEmbarcacion}
                                            </p>
                                            <p className="text-[10px] opacity-60 font-mono mt-1">{req.numeroRegistro}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black tracking-widest px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                {req.condicion}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{req.capitaniaPuerto}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                req.status === 'REVIEWING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {req.status === 'PENDING' && <AlertCircle size={12} />}
                                                {req.status === 'REVIEWING' && <Clock size={12} />}
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
                                    <Satellite size={20} /> Desactivación de Baliza Satelital
                                </h3>
                                <button onClick={() => setSelectedReq(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="space-y-6 overflow-y-auto p-6">
                                {/* Datos del Solicitante */}
                                <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Solicitante</p>
                                        <p className="font-bold text-sm">{selectedReq.nombreSolicitante}</p>
                                        <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                                            {selectedReq.correo}
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
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre de la Embarcación</p>
                                            <p className="font-bold">{selectedReq.nombreEmbarcacion}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Número de Registro</p>
                                            <p className="font-bold font-mono">{selectedReq.numeroRegistro}</p>
                                        <div>
                                        </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Condición</p>
                                            <p className="font-bold">{selectedReq.condicion}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Capitanía de Puerto</p>
                                            <p className="font-bold text-brand-secondary">{selectedReq.capitaniaPuerto}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fecha y Hora */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Calendar size={16} className="text-brand-secondary" /> Fecha y Hora de Solicitud
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Fecha y Hora</p>
                                            <p className="font-bold">
                                                {selectedReq.fechaHora 
                                                    ? new Date(selectedReq.fechaHora).toLocaleString() 
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Motivo */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <FileText size={16} className="text-brand-secondary" /> Motivo de la Desactivación
                                    </h4>
                                    <div className="bg-white/5 rounded-xl p-4 text-sm max-h-32 overflow-y-auto">
                                        {selectedReq.motivo}
                                    </div>
                                </div>

                                {/* Firma */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <PenTool size={16} className="text-brand-secondary" /> Firma del Solicitante
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

                                {/* Formulario de Comentario CIM */}
                                {userRole === "CIM" && selectedReq.status === "PENDING" && (
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Agregar Observación</label>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none h-24"
                                            placeholder="Ej: Solicitud verificada, proceder con desactivación..."
                                            value={cimCommentInput}
                                            onChange={(e) => setCimCommentInput(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions / Footer */}
                            <div className="p-6 border-t border-white/10 bg-black/20 flex items-center justify-end gap-3 mt-auto">
                                <button
                                    disabled={loading}
                                    onClick={() => updateStatus(selectedReq.id, 'REJECTED')}
                                    className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                >
                                    Rechazar
                                </button>

                                {userRole === "CIM" && selectedReq.status === "PENDING" && (
                                    <button
                                        disabled={loading}
                                        onClick={() => updateStatus(selectedReq.id, 'APPROVED')}
                                        className="px-6 py-2.5 rounded-xl bg-brand-secondary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Check size={16} /> Aprobar Desactivación
                                    </button>
                                )}

                                {selectedReq.status === "APPROVED" && (
                                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase border border-green-500/30">
                                        Desactivación Aprobada
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

export default function DesactivacionBalizaAdminPage() {
    const [requests, setRequests] = useState<BalizaRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>("PUBLIC");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqRes, sessionRes] = await Promise.all([
                    fetch("/api/public/desactivacion-baliza"),
                    fetch("/api/auth/session")
                ]);
                const reqData = await reqRes.json();
                const sessionData = await sessionRes.json();
                
                setRequests(Array.isArray(reqData) ? reqData : []);
                setUserRole(sessionData?.user?.role || "PUBLIC");
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRefresh = () => {
        fetch("/api/public/desactivacion-baliza")
            .then(res => res.json())
            .then(data => setRequests(Array.isArray(data) ? data : []));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                        <Satellite className="text-brand-secondary" size={32} />
                        Desactivación de <span className="text-brand-secondary">Baliza Satelital</span>
                    </h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Gestión de solicitudes de desactivación de dispositivos satelitales</p>
                </div>
                <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div> {requests.filter((r) => r.status === 'PENDING').length} PENDIENTES
                </div>
            </div>

            <BalizaTable requests={requests} userRole={userRole} onRefresh={handleRefresh} />
        </div>
    );
}

