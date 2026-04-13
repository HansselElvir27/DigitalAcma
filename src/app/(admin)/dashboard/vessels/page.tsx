"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ship, Anchor, Search, Eye, Filter, Download, MoreVertical, ExternalLink, MapPin, ClipboardList, RefreshCw } from "lucide-react";
import Link from "next/link";
import { NotificationModal, ModalType } from "@/components/NotificationModal";

interface Vessel {
    id: string;
    registrationNumber: string;
    vesselName: string;
    vesselType: string;
    activityType: string;
    ownerName: string;
    status: string;
    port: { name: string };
    createdAt: string;
    expirationDate?: string;
}

export default function RegisteredVesselsPage() {
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: ModalType;
        title: string;
        message: string;
        confirmText?: string;
        onConfirm?: () => void;
    }>({
        isOpen: false,
        type: "INFO",
        title: "",
        message: "",
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
    const showModal = (config: Omit<typeof modalConfig, "isOpen">) => {
        setModalConfig({ ...config, isOpen: true });
    };

    useEffect(() => {
        const fetchVessels = async () => {
            try {
                const res = await fetch("/api/vessels");
                const data = await res.json();
                setVessels(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching vessels:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVessels();
    }, []);

    const filteredVessels = vessels.filter(v => 
        v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRenew = async (vessel: Vessel) => {
        showModal({
            type: "CONFIRM",
            title: "Confirmar Renovación",
            message: `¿Desea iniciar el proceso de renovación para la embarcación "${vessel.vesselName}" (${vessel.registrationNumber})?`,
            confirmText: "Iniciar Renovación",
            onConfirm: async () => {
                closeModal();
                try {
                    const res = await fetch(`/api/vessels/${vessel.id}/renew`, { method: 'POST' });
                    if (res.ok) {
                        showModal({
                            type: "SUCCESS",
                            title: "Proceso Iniciado",
                            message: "La solicitud de renovación ha sido creada exitosamente. El capitán podrá asignar una nueva cita desde el Panel de Inscripciones.",
                            confirmText: "Ir al Panel",
                            onConfirm: () => {
                                window.location.href = '/dashboard/inscripcion-embarcaciones';
                            }
                        });
                    } else {
                        const data = await res.json();
                        showModal({
                            type: "ERROR",
                            title: "Error de Renovación",
                            message: data.error || "No se pudo iniciar el proceso de renovación en este momento."
                        });
                    }
                } catch (e) {
                    showModal({
                        type: "ERROR",
                        title: "Error de Sistema",
                        message: "Hubo un problema de conexión con el servidor."
                    });
                }
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic flex items-center gap-3">
                        <Anchor className="text-brand-secondary" size={36} />
                        Buques <span className="text-brand-secondary">Registrados</span>
                    </h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Registro nacional de embarcaciones y permisos vigentes</p>
                </div>
                <div className="bg-brand-secondary/10 text-brand-secondary px-4 py-2 rounded-full text-xs font-bold border border-brand-secondary/20 flex items-center gap-2">
                    <Ship size={14} /> {filteredVessels.length} Embarcaciones
                </div>
            </div>

            {/* Filters / Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, matrícula o propietario..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none transition-all" 
                    />
                </div>
                <button className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-2 hover:bg-white/10 transition-all opacity-60">
                    <Filter size={18} />
                    <span className="text-sm font-bold">Filtros</span>
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">Cargando registros...</p>
                </div>
            ) : filteredVessels.length === 0 ? (
                <div className="glass-card rounded-3xl p-20 text-center border border-white/5 shadow-2xl">
                    <Ship size={64} className="mx-auto mb-6 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">No se encontraron embarcaciones</h3>
                    <p className="opacity-40 text-sm max-w-xs mx-auto">Prueba con términos de búsqueda diferentes o verifica los filtros aplicados.</p>
                </div>
            ) : (
                <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Embarcación</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Categoría</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Propietario</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Puerto</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Registro</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredVessels.map((vessel, i) => (
                                <motion.tr 
                                    key={vessel.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">
                                                <Ship size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm uppercase group-hover:text-brand-secondary transition-colors">{vessel.vesselName}</p>
                                                <p className="font-mono text-[10px] text-red-500 font-black">{vessel.registrationNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">{vessel.vesselType}</p>
                                            <p className="text-[10px] opacity-40 uppercase font-medium">{vessel.activityType}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium">
                                        {vessel.ownerName || <span className="opacity-20 italic">No registrado</span>}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs opacity-60">
                                            <MapPin size={12} className="text-brand-secondary" />
                                            {vessel.port.name}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[10px] opacity-40 font-bold">{new Date(vessel.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Status Badge */}
                                            {vessel.expirationDate && new Date(vessel.expirationDate) < new Date() ? (
                                                <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/30">Vencido</span>
                                            ) : (vessel.expirationDate && new Date(vessel.expirationDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000) ? (
                                                <span className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest border border-amber-500/30">Por Vencer</span>
                                            ) : null}

                                            <Link 
                                                href={`/dashboard/vessels/${vessel.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-brand-secondary text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-xl group/btn"
                                            >
                                                <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                Permiso
                                            </Link>
                                            <Link 
                                                href={`/dashboard/vessels/${vessel.id}?view=expediente`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-indigo-600 text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-xl group/btn"
                                            >
                                                <ClipboardList size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                Expediente
                                            </Link>

                                            {(vessel.expirationDate && new Date(vessel.expirationDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000) && (
                                                <button 
                                                    onClick={() => handleRenew(vessel)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-secondary/20 border border-brand-secondary/30 hover:bg-brand-secondary text-brand-secondary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-xl group/btn"
                                                >
                                                    <RefreshCw size={14} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                                                    Renovar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <NotificationModal 
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
            />
        </div>
    );
}
