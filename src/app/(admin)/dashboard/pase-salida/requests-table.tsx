"use client";

import { useState } from "react";
import { Clock, CheckCircle, AlertCircle, Eye, X, Check, Anchor, Ship, MapPin, PenTool, FileText, User, LifeBuoy } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function PaseSalidaTable({ requests, userRole }: { requests: any[], userRole: string }) {
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [cimCommentInput, setCimCommentInput] = useState("");
    const [rejectionMode, setRejectionMode] = useState(false);
    const [rejectionComment, setRejectionComment] = useState("");
    const [captainCommentInput, setCaptainCommentInput] = useState("");
    const router = useRouter();

    const updateStatus = async (id: string, status: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    type: "PASE_SALIDA",
                    cimComment: status === "PRE_APPROVED" ? cimCommentInput : undefined,
                    captainComment: (userRole === "CAPITAN" || userRole === "ADMIN") 
                        ? (status === "REJECTED" ? rejectionComment : captainCommentInput)
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
            setCaptainCommentInput("");
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
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha / ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Embarcación / Matrícula</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Salida</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto / Destino</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Tipo</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center opacity-40 text-sm">No hay solicitudes de pase de salida registradas</td>
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
                                            <p className="text-xs opacity-60">{req.departureTime}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{req.departurePort}</p>
                                            <p className="text-xs opacity-60">➡ {req.destination}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black tracking-widest px-2 py-1 rounded-md border ${
                                                req.activityType === 'Buceo' 
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {req.activityType}
                                            </span>
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
                                    <LifeBuoy size={20} /> Solicitud de Pase de Salida
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
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Operador</p>
                                        <p className="font-bold text-sm">{selectedReq.operatorName}</p>
                                        <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                                            {selectedReq.email}
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
                                            <p className="font-bold">{selectedReq.vesselName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Matrícula</p>
                                            <p className="font-bold font-mono">{selectedReq.registrationNum}</p>
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
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Puerto de Salida</p>
                                            <p className="font-bold">{selectedReq.departurePort}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Destino</p>
                                            <p className="font-bold text-brand-secondary">{selectedReq.destination}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Fecha de Salida</p>
                                            <p className="font-bold">
                                                {selectedReq.departureDate 
                                                    ? new Date(selectedReq.departureDate).toLocaleDateString() 
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Hora de Salida</p>
                                            <p className="font-bold">{selectedReq.departureTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Tipo de Actividad</p>
                                            <p className="font-bold">{selectedReq.activityType}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Guía (si aplica) */}
                                {selectedReq.guideName && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                            <User size={16} className="text-brand-secondary" /> Guía
                                        </h4>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre del Guía</p>
                                            <p className="font-bold">{selectedReq.guideName}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Tripulación y Pasajeros */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <User size={16} className="text-brand-secondary" /> Tripulación y Pasajeros
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Lista de Tripulantes</p>
                                            <div className="bg-white/5 rounded-xl p-4 text-sm max-h-32 overflow-y-auto">
                                                {selectedReq.crewList || 'No especificada'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Lista de Pasajeros</p>
                                            <div className="bg-white/5 rounded-xl p-4 text-sm max-h-32 overflow-y-auto">
                                                {selectedReq.passengerList || 'No especificada'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Firma */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <PenTool size={16} className="text-brand-secondary" /> Firma del Operador
                                    </h4>
                                    {selectedReq.signature ? (
                                        <div className="bg-slate-200 rounded-2xl p-4 border border-white/10 flex justify-center">
                                            <img src={selectedReq.signature?.startsWith('/uploads/') ? `/api${selectedReq.signature}` : selectedReq.signature} alt="Firma Digital" className="max-h-32 opacity-90 object-contain" />
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

                                {selectedReq.captainComment && (
                                    <div className="p-4 bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1">Observación de Capitanía</p>
                                        <p className="text-sm italic">"{selectedReq.captainComment}"</p>
                                    </div>
                                )}

                                {/* Formulario de Pre-aprobación CIM */}
                                {userRole === "CIM" && selectedReq.status === "PENDING" && (
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Agregar Observación</label>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none h-24"
                                            placeholder="Ej: Documentos verificados, embarcación apta para zarpe..."
                                            value={cimCommentInput}
                                            onChange={(e) => setCimCommentInput(e.target.value)}
                                        />
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
                                                <Check size={16} /> Pre-Aprobar
                                            </button>
                                        )}

                                        {(userRole === "CAPITAN" || userRole === "ADMIN") && selectedReq.status === "PRE_APPROVED" && (
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Observación de Autorización (Capitanía)</label>
                                                    <textarea
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-brand-secondary outline-none h-20 resize-none text-white"
                                                        placeholder="Agregue un comentario final para el pase de salida..."
                                                        value={captainCommentInput}
                                                        onChange={(e) => setCaptainCommentInput(e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    disabled={loading}
                                                    onClick={() => updateStatus(selectedReq.id, 'APPROVED')}
                                                    className="px-6 py-2.5 rounded-xl bg-brand-secondary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Check size={16} /> Autorizar Salida
                                                </button>
                                            </div>
                                        )}

                                        {selectedReq.status === "APPROVED" && (
                                            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase border border-green-500/30">
                                                Pase de Salida Autorizado
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

