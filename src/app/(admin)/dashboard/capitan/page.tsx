"use client";

import { motion } from "framer-motion";
import { Ship, Anchor, FileCheck, AlertTriangle, Printer, QrCode, Navigation } from "lucide-react";
import { useState, useEffect } from "react";

export default function CapitanDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ZARPES PENDIENTES");

    const fetchData = async () => {
        try {
            const res = await fetch("/api/stats/capitan");
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error("Error fetching capitan data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAuthorizeZarpe = async (id: string) => {
        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED", type: "ZARPE" })
            });
            if (res.ok) {
                alert("Zarpe autorizado con éxito");
                fetchData();
            }
        } catch (error) {
            alert("Error al autorizar");
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin"></div>
            </div>
        );
    }

    const tabs = ["ZARPES PENDIENTES", "PASES DE SALIDA", "ALERTAS", "HISTORIAL"];

    return (
        <div className="space-y-10 relative">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic underline decoration-brand-secondary decoration-4">Capitanía <span className="text-brand-secondary text-2xl">{data?.portName || "PRINCIPAL"}</span></h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Despacho de Embarcaciones y Control de Muelles</p>
                </div>
                <div className="flex gap-4">
                    <button className="glass-card px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Printer size={14} /> IMPRIMIR REPORTES
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="glass-card p-1 rounded-2xl flex overflow-x-auto scroolbar-hide">
                        {tabs.map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === tab ? 'premium-gradient text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                            >
                                {tab}
                                {tab === "ALERTAS" && data?.vesselsExpiring?.length > 0 && (
                                    <span className="ml-2 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">
                                        {data.vesselsExpiring.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {activeTab === "ZARPES PENDIENTES" && (
                            (!data?.zarpesPendientes || data.zarpesPendientes.length === 0) ? (
                                <div className="col-span-2 glass-card p-10 text-center opacity-40 italic">No hay zarpes pendientes para este puerto</div>
                            ) : (
                                data.zarpesPendientes.map((zarpe: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-6 rounded-2xl group hover:border-brand-secondary/30 transition-all border border-transparent"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center">
                                                <Ship size={24} />
                                            </div>
                                            <span className="text-[10px] font-black px-2 py-1 rounded bg-white/5 opacity-40">{zarpe.id}</span>
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight mb-1">{zarpe.ship}</h3>
                                        <p className="text-[10px] font-bold text-brand-secondary tracking-widest mb-4 uppercase">{zarpe.status}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-[10px] opacity-40 font-bold">{zarpe.time}</span>
                                            <button
                                                onClick={() => handleAuthorizeZarpe(zarpe.id)}
                                                className="premium-gradient px-4 py-2 rounded-lg text-[10px] font-black text-white shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform"
                                            >
                                                <FileCheck size={14} /> AUTORIZAR
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )
                        )}

                        {activeTab === "ALERTAS" && (
                            (!data?.vesselsExpiring || data.vesselsExpiring.length === 0) ? (
                                <div className="col-span-2 glass-card p-10 text-center opacity-40 italic">No hay alertas de expiración próximas</div>
                            ) : (
                                data.vesselsExpiring.map((v: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500 bg-red-500/5"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-red-400">
                                                <AlertTriangle size={24} />
                                            </div>
                                            <span className="text-[8px] font-black bg-white/5 px-2 py-1 rounded opacity-40 uppercase">Registro: {v.regNum}</span>
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight mb-1 uppercase">{v.name}</h3>
                                        <p className="text-[10px] font-medium opacity-60 mb-4">El permiso de navegación expira pronto.</p>
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="text-[10px] font-bold">
                                                <span className="opacity-40">EXPIRA:</span> <span className="text-red-400">{new Date(v.expirationDate).toLocaleDateString()}</span>
                                            </div>
                                            <a 
                                                href={`/dashboard/vessels/${v.id}`}
                                                className="text-[10px] font-black text-brand-secondary hover:underline underline-offset-4"
                                            >
                                                VER DETALLES
                                            </a>
                                        </div>
                                    </motion.div>
                                ))
                            )
                        )}

                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-3xl bg-brand-secondary/5 border-brand-secondary/20 border text-center space-y-4">
                        <QrCode size={64} className="mx-auto text-brand-secondary opacity-40" />
                        <h4 className="font-bold">Validación Rápida</h4>
                        <p className="text-xs opacity-50">Escanee el código QR del documento para verificar la autenticidad del zarpe.</p>
                        <button className="w-full py-3 bg-white/5 rounded-xl text-[10px] font-black tracking-widest hover:bg-white/10 transition-colors uppercase">Abrir Escáner</button>
                    </div>

                    <div className="glass-card p-6 rounded-2xl space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-500" /> Avisos de Clima
                        </h4>
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-amber-200 font-medium">Fuertes marejadas detectadas en zona Norte. Se recomienda precaución para embarcaciones pequeñas.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
