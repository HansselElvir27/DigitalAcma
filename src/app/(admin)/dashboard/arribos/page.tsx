"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Anchor, Calendar, Clock, Shield, User, Mail, Eye, FileText, CheckCircle, Ship, Camera } from "lucide-react";

export default function ArribosPage() {
    const [notices, setNotices] = useState<any[]>([]);
    const [recreationalNotices, setRecreationalNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<"commercial" | "recreational">("commercial");

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // Fetch commercial notices
                const res = await fetch("/api/public/aviso-arribo");
                const data = await res.json();
                setNotices(Array.isArray(data) ? data : []);
                
                // Fetch recreational notices
                const resRec = await fetch("/api/public/aviso-arribo-recreativo");
                const dataRec = await resRec.json();
                setRecreationalNotices(Array.isArray(dataRec) ? dataRec : []);
            } catch (error) {
                console.error("Error fetching arrival notices:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    const handleApprove = async (id: string, type: string) => {
        if (!confirm("¿Está seguro de que desea aprobar este aviso de arribo?")) return;

        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED", type }),
            });

            if (res.ok) {
                // Update local state
                if (type === "AVISO_ARRIBO") {
                    setNotices(prev => prev.map(n => n.id === id ? { ...n, status: "APPROVED" } : n));
                } else {
                    setRecreationalNotices(prev => prev.map(n => n.id === id ? { ...n, status: "APPROVED" } : n));
                }
                setSelectedNotice(null);
            } else {
                const data = await res.json();
                alert(data.error || "Error al aprobar el aviso");
            }
        } catch (error) {
            alert("Error de conexión al intentar aprobar");
        }
    };

    const getProtectionLevelColor = (level: string) => {
        switch (level) {
            case "1": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "2": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "3": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-white/5 text-white/60 border-white/10";
        }
    };

    const currentNotices = activeTab === "commercial" ? notices : recreationalNotices;

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Avisos de <span className="text-brand-secondary">Arribo</span></h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Notificaciones Recibidas</p>
                </div>
                <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-2">
                    <FileText size={14} /> {currentNotices.length} Avisos Registrados
                </div>
            </div>

            {/* Tabs for Commercial and Recreational */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("commercial")}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        activeTab === "commercial" 
                            ? "premium-gradient text-white" 
                            : "glass-card text-white/60 hover:text-white"
                    }`}
                >
                    <Anchor size={18} className="inline mr-2" />
                    Comercial ({notices.length})
                </button>
                <button
                    onClick={() => setActiveTab("recreational")}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        activeTab === "recreational" 
                            ? "premium-gradient text-white" 
                            : "glass-card text-white/60 hover:text-white"
                    }`}
                >
                    <Ship size={18} className="inline mr-2" />
                    Recreativo ({recreationalNotices.length})
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin"></div>
                </div>
            ) : currentNotices.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <Anchor size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg opacity-60">No hay avisos de arrivalo registrados</p>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha Registro</th>
                                    {activeTab === "commercial" ? (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Señal Distintiva</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Nivel</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Embarcación</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Tipo</th>
                                        </>
                                    )}
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto Arribo</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">ETA</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {currentNotices.map((notice) => (
                                    <tr key={notice.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm tracking-tight">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] opacity-40 font-mono tracking-tighter">{notice.id.slice(-8).toUpperCase()}</p>
                                        </td>
                                        {activeTab === "commercial" ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-sm font-mono">{notice.distinctiveSignal}</p>
                                                    {notice.vesselName && <p className="text-xs opacity-60">{notice.vesselName}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${getProtectionLevelColor(notice.protectionLevel)}`}>
                                                        <Shield size={12} /> Nivel {notice.protectionLevel}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-sm">{notice.vesselName}</p>
                                                    <p className="text-xs opacity-60 font-mono">{notice.registrationNum}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                        <Ship size={12} /> {notice.vesselType}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{notice.arrivalPort}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-brand-secondary">{new Date(notice.etaDate).toLocaleDateString()}</p>
                                            <p className="text-xs opacity-60">{new Date(notice.etaDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedNotice({...notice, type: activeTab})}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-secondary transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Detalles */}
            {selectedNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-brand-primary w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto"
                    >
                        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between premium-gradient shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                {selectedNotice.type === "commercial" ? <Anchor size={20} /> : <Ship size={20} />} 
                                <span className="hidden sm:inline">Detalles del Aviso de Arribo</span>
                                <span className="sm:hidden">Aviso de Arribo</span>
                                {selectedNotice.type === "recreational" ? " Recreativo" : " Comercial"}
                            </h3>
                            <button onClick={() => setSelectedNotice(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors shrink-0">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">ID de Registro</p>
                                    <p className="font-mono text-sm">{selectedNotice.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Fecha de Registro</p>
                                    <p className="font-bold text-sm">{new Date(selectedNotice.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedNotice.type === "commercial" ? (
                                <>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                            <Anchor size={16} className="text-brand-secondary" /> Datos del Buque
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Señal Distintiva</p>
                                                <p className="font-bold font-mono">{selectedNotice.distinctiveSignal}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre</p>
                                                <p className="font-bold">{selectedNotice.vesselName || 'No especificado'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                            <Shield size={16} className="text-brand-secondary" /> Nivel de Protección
                                        </h4>
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black tracking-widest border ${getProtectionLevelColor(selectedNotice.protectionLevel)}`}>
                                            <Shield size={16} /> NIVEL {selectedNotice.protectionLevel}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                            <Ship size={16} className="text-brand-secondary" /> Datos de la Embarcación
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre</p>
                                                <p className="font-bold">{selectedNotice.vesselName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Registro/Matrícula</p>
                                                <p className="font-bold font-mono">{selectedNotice.registrationNum}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Bandera</p>
                                                <p className="font-bold">{selectedNotice.flag}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Tipo de Buque</p>
                                                <p className="font-bold">{selectedNotice.vesselType}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                            <Anchor size={16} className="text-brand-secondary" /> Ruta
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Puerto de Procedencia</p>
                                                <p className="font-bold">{selectedNotice.departurePort}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">País de Procedencia</p>
                                                <p className="font-bold">{selectedNotice.countryOrigin}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                            <User size={16} className="text-brand-secondary" /> Personas a Bordo
                                        </h4>
                                        <div className="p-4 bg-white/5 rounded-xl">
                                            <p className="text-sm whitespace-pre-wrap">{selectedNotice.personsOnBoard}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                    <Calendar size={16} className="text-brand-secondary" /> Detalles del Arribo
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Puerto de Arribo</p>
                                        <p className="font-bold">{selectedNotice.arrivalPort}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">ETA</p>
                                        <p className="font-bold text-brand-secondary">
                                            {new Date(selectedNotice.etaDate).toLocaleDateString()} {" "}
                                            {new Date(selectedNotice.etaDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-brand-secondary" /> Información de Contacto
                                </h4>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Email</p>
                                    <p className="font-bold">{selectedNotice.user?.email || 'No disponible'}</p>
                                </div>
                            </div>

                            {/* Foto de la Embarcación */}
                            {selectedNotice.vesselPhoto && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Camera size={16} className="text-brand-secondary" /> Foto de la Embarcación
                                    </h4>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <img 
                                            src={selectedNotice.vesselPhoto} 
                                            alt="Foto de la embarcación" 
                                            className="w-full max-h-48 object-contain rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Approval Feedback */}
                            {selectedNotice.status === 'APPROVED' && (
                                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500" size={24} />
                                        <div>
                                            <p className="font-bold text-green-400">Arribo Aprobado</p>
                                            <p className="text-sm opacity-60">Esta notificación ha sido revisada y autorizada por CIM.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20 shrink-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-green-500">
                                    <CheckCircle size={20} />
                                    <span className="font-bold text-sm">Estado: {selectedNotice.status === 'APPROVED' ? 'Aprobado' : 'Recibido'}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setSelectedNotice(null)}
                                        className="px-6 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    {selectedNotice.status !== 'APPROVED' && (
                                        <button 
                                            onClick={() => handleApprove(selectedNotice.id, selectedNotice.type === "commercial" ? "AVISO_ARRIBO" : "AVISO_ARRIBO_RECREATIVO")}
                                            className="px-6 py-2 rounded-xl premium-gradient text-white font-bold text-sm hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            Aprobar Arribo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

