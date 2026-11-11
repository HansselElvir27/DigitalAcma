"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, User, MapPin, CheckCircle2, Clock, Eye, Printer, ShieldCheck, X, FileText, Camera } from "lucide-react";
import { PatronLanchaCarnetDocument } from "@/components/PatronLanchaCarnetDocument";

export default function PatronLanchaAdminPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED">("PENDING");

    // Modal de emisión
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [capacidadRestan, setCapacidadRestan] = useState("5 TONELADAS");
    const [puertoRegistro, setPuertoRegistro] = useState("");
    const [captainSignature, setCaptainSignature] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal de visualización de carnet emitido
    const [viewCarnet, setViewCarnet] = useState<any | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/public/patron-lancha");
            if (res.ok) {
                const data = await res.json();
                setRequests(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Error al obtener solicitudes:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const openEmitModal = (req: any) => {
        setSelectedReq(req);
        setCapacidadRestan("5 TONELADAS");
        setPuertoRegistro(req.port?.name || "TELA");
    };

    const handleEmitCarnet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReq) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/patron-lancha/${selectedReq.id}/emitir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    capacidadRestan: capacidadRestan.trim() || "5 TONELADAS",
                    puertoRegistro: puertoRegistro.trim() || selectedReq.port?.name || "TELA",
                    captainSignature: captainSignature.trim() || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Error al emitir carnet");
            }

            // Mostrar el carnet emitido
            setSelectedReq(null);
            setViewCarnet(data.carnet);
            fetchRequests();
        } catch (err: any) {
            alert(err.message || "Error al emitir carnet");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRequests = requests.filter((r) => {
        if (activeTab === "PENDING") return r.status === "PENDING";
        return r.status === "APPROVED";
    });

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Award className="text-brand-secondary" size={32} />
                        Gestión de Patrón de Lancha Costeras
                    </h1>
                    <p className="opacity-60 text-sm">
                        Revisión de solicitudes y emisión de carnets oficiales para operadores de embarcaciones menores
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab("PENDING")}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "PENDING"
                                ? "premium-gradient text-white shadow-lg"
                                : "opacity-60 hover:opacity-100"
                        }`}
                    >
                        Pendientes ({requests.filter((r) => r.status === "PENDING").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("APPROVED")}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "APPROVED"
                                ? "premium-gradient text-white shadow-lg"
                                : "opacity-60 hover:opacity-100"
                        }`}
                    >
                        Emitidos / Aprobados ({requests.filter((r) => r.status === "APPROVED").length})
                    </button>
                </div>
            </div>

            {/* Listado */}
            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl text-center space-y-3 opacity-60">
                    <Award size={48} className="mx-auto opacity-30" />
                    <p className="font-semibold text-lg">No hay solicitudes en esta sección.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((req) => (
                        <div
                            key={req.id}
                            className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-brand-secondary/40 transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-secondary block font-bold">
                                            {req.tituloNumero}
                                        </span>
                                        <h3 className="font-bold text-base text-white uppercase leading-tight">
                                            {req.nombres} {req.apellidos}
                                        </h3>
                                    </div>
                                    <span
                                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            req.status === "APPROVED"
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                        }`}
                                    >
                                        {req.status === "APPROVED" ? "EMITIDO" : "PENDIENTE"}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs opacity-80 pt-2 border-t border-white/5 font-mono">
                                    <div className="flex justify-between">
                                        <span className="opacity-50">Identidad:</span>
                                        <span>{req.identidad}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-50">Capitanía:</span>
                                        <span className="font-bold text-white uppercase">{req.port?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-50">Nacionalidad:</span>
                                        <span>{req.nacionalidad}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-50">Fecha Solicitud:</span>
                                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Miniatura de la fotografía y recibo */}
                                <div className="flex items-center gap-3 pt-2">
                                    {req.fotografia && (
                                        <a
                                            href={req.fotografia}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="relative group rounded-lg overflow-hidden border border-white/10 w-12 h-14 bg-black/40"
                                            title="Ver fotografía de carnet"
                                        >
                                            <img
                                                src={req.fotografia}
                                                alt="Carnet"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Eye size={12} className="text-white" />
                                            </div>
                                        </a>
                                    )}
                                    {req.reciboPago && (
                                        <a
                                            href={req.reciboPago}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-brand-secondary hover:underline flex items-center gap-1 font-sans"
                                        >
                                            <FileText size={14} /> Ver Recibo de Pago
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="pt-4 border-t border-white/5">
                                {req.status === "PENDING" ? (
                                    <button
                                        onClick={() => openEmitModal(req)}
                                        className="w-full premium-gradient py-2.5 rounded-xl text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <ShieldCheck size={16} /> Emitir Patrón de Lancha
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setViewCarnet(req.carnet)}
                                        className="w-full bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Printer size={16} /> Ver Carnet Oficial
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL: Emitir Patrón de Lancha */}
            <AnimatePresence>
                {selectedReq && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card bg-[#0f172a] border border-white/20 p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-start border-b border-white/10 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                                        <Award className="text-brand-secondary" />
                                        Aprobar y Emitir Patrón de Lancha
                                    </h2>
                                    <p className="text-xs opacity-60 mt-1">
                                        Título N°: <span className="font-mono text-brand-secondary">{selectedReq.tituloNumero}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedReq(null)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEmitCarnet} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                                        Lanchero / Titular
                                    </label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white uppercase">
                                        {selectedReq.nombres} {selectedReq.apellidos}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                                            CAPACIDAD RESTAN/HASTA *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={capacidadRestan}
                                            onChange={(e) => setCapacidadRestan(e.target.value)}
                                            placeholder="5 TONELADAS"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm uppercase focus:border-brand-secondary outline-none font-bold text-brand-secondary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                                            PUERTO DE REGISTRO *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={puertoRegistro}
                                            onChange={(e) => setPuertoRegistro(e.target.value)}
                                            placeholder="TELA"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm uppercase focus:border-brand-secondary outline-none font-bold text-white"
                                        />
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs space-y-1">
                                    <p className="font-bold text-amber-300">Vigencia Oficial:</p>
                                    <p className="opacity-80">
                                        Emisión: <strong>Hoy ({new Date().toLocaleDateString()})</strong> | Expiración:{" "}
                                        <strong>2 años después ({new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString()})</strong>
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedReq(null)}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition-all text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="premium-gradient px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Emitiendo...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} />
                                                <span>Aprobar y Emitir</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: Visualización de Carnet Emitido */}
            <AnimatePresence>
                {viewCarnet && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-white/20 p-6 md:p-8 rounded-3xl max-w-5xl w-full my-8 space-y-6 shadow-2xl relative"
                        >
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <h2 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                                    <Award className="text-brand-secondary" /> Carnet de Patrón de Lancha Costeras
                                </h2>
                                <button
                                    onClick={() => setViewCarnet(null)}
                                    className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <PatronLanchaCarnetDocument carnet={viewCarnet} showPrintButton={true} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
