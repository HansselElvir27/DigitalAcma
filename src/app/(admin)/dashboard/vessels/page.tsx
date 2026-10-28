"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ship, Anchor, Search, Eye, Filter, RefreshCw,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    MapPin, ClipboardList
} from "lucide-react";
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

interface PaginatedResponse {
    data: Vessel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export default function RegisteredVesselsPage() {
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

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

    // Debounce search input — wait 350ms before sending request
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on new search
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchVessels = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page:  String(page),
                limit: String(limit),
                ...(debouncedSearch ? { search: debouncedSearch } : {}),
            });
            const res = await fetch(`/api/vessels?${params}`);
            const json: PaginatedResponse = await res.json();
            setVessels(Array.isArray(json.data) ? json.data : []);
            setTotal(json.total ?? 0);
            setTotalPages(json.totalPages ?? 0);
        } catch (error) {
            console.error("Error fetching vessels:", error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch]);

    useEffect(() => {
        fetchVessels();
    }, [fetchVessels]);

    const handlePageSizeChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleRenew = async (vessel: Vessel) => {
        showModal({
            type: "CONFIRM",
            title: "Confirmar Renovación",
            message: `¿Desea iniciar el proceso de renovación para la embarcación "${vessel.vesselName}" (${vessel.registrationNumber})?`,
            confirmText: "Iniciar Renovación",
            onConfirm: async () => {
                closeModal();
                try {
                    const res = await fetch(`/api/vessels/${vessel.id}/renew`, { method: "POST" });
                    if (res.ok) {
                        showModal({
                            type: "SUCCESS",
                            title: "Proceso Iniciado",
                            message: "La solicitud de renovación ha sido creada exitosamente. El capitán podrá asignar una nueva cita desde el Panel de Inscripciones.",
                            confirmText: "Ir al Panel",
                            onConfirm: () => { window.location.href = "/dashboard/inscripcion-embarcaciones"; },
                        });
                    } else {
                        const data = await res.json();
                        showModal({
                            type: "ERROR",
                            title: "Error de Renovación",
                            message: data.error || "No se pudo iniciar el proceso de renovación.",
                        });
                    }
                } catch {
                    showModal({ type: "ERROR", title: "Error de Sistema", message: "Problema de conexión con el servidor." });
                }
            },
        });
    };

    const isExpired = (v: Vessel) => v.expirationDate && new Date(v.expirationDate) < new Date();
    const isExpiringSoon = (v: Vessel) =>
        v.expirationDate &&
        !isExpired(v) &&
        new Date(v.expirationDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

    // Pagination range helper — show at most 5 page buttons around current
    const getPaginationRange = () => {
        const delta = 2;
        const range: (number | "...")[] = [];
        const left = Math.max(2, page - delta);
        const right = Math.min(totalPages - 1, page + delta);

        range.push(1);
        if (left > 2) range.push("...");
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages - 1) range.push("...");
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic flex items-center gap-3">
                        <Anchor className="text-brand-secondary" size={36} />
                        Buques <span className="text-brand-secondary">Registrados</span>
                    </h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Registro nacional de embarcaciones y permisos vigentes</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-brand-secondary/10 text-brand-secondary px-4 py-2 rounded-full text-xs font-bold border border-brand-secondary/20 flex items-center gap-2">
                        <Ship size={14} /> {total.toLocaleString()} Embarcaciones
                    </div>
                </div>
            </div>

            {/* Search + Page size selector */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, matrícula o propietario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        >✕</button>
                    )}
                </div>

                {/* Page size picker */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <Filter size={16} className="opacity-40" />
                    <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Filas:</span>
                    <div className="flex gap-1">
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <button
                                key={size}
                                onClick={() => handlePageSizeChange(size)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                                    limit === size
                                        ? "premium-gradient text-white shadow-md"
                                        : "hover:bg-white/10 text-white/60 hover:text-white"
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">Cargando registros...</p>
                </div>
            ) : vessels.length === 0 ? (
                <div className="glass-card rounded-3xl p-20 text-center border border-white/5 shadow-2xl">
                    <Ship size={64} className="mx-auto mb-6 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">No se encontraron embarcaciones</h3>
                    <p className="opacity-40 text-sm max-w-xs mx-auto">
                        {debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : "No hay registros disponibles."}
                    </p>
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
                            {vessels.map((vessel, i) => (
                                <motion.tr
                                    key={vessel.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.015 }}
                                    className="hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="px-8 py-5">
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
                                    <td className="px-8 py-5">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">{vessel.vesselType}</p>
                                            <p className="text-[10px] opacity-40 uppercase font-medium">{vessel.activityType}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium">
                                        {vessel.ownerName || <span className="opacity-20 italic">No registrado</span>}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs opacity-60">
                                            <MapPin size={12} className="text-brand-secondary" />
                                            {vessel.port?.name}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[10px] opacity-40 font-bold">{new Date(vessel.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 flex-wrap">
                                            {isExpired(vessel) && (
                                                <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/30">Vencido</span>
                                            )}
                                            {isExpiringSoon(vessel) && (
                                                <span className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest border border-amber-500/30">Por Vencer</span>
                                            )}
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
                                            {(isExpired(vessel) || isExpiringSoon(vessel)) && (
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

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    {/* Info */}
                    <p className="text-xs opacity-40 font-mono">
                        Mostrando{" "}
                        <span className="text-white font-bold">{((page - 1) * limit) + 1}</span>
                        {" "}–{" "}
                        <span className="text-white font-bold">{Math.min(page * limit, total)}</span>
                        {" "}de{" "}
                        <span className="text-white font-bold">{total.toLocaleString()}</span>
                        {" "}embarcaciones
                    </p>

                    {/* Page buttons */}
                    <div className="flex items-center gap-1">
                        {/* First page */}
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronsLeft size={16} />
                        </button>

                        {/* Previous page */}
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Numbered pages */}
                        {getPaginationRange().map((item, i) =>
                            item === "..." ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-white/30 text-sm select-none">…</span>
                            ) : (
                                <button
                                    key={item}
                                    onClick={() => setPage(item as number)}
                                    className={`min-w-[36px] h-9 rounded-lg text-xs font-black transition-all border ${
                                        page === item
                                            ? "premium-gradient text-white border-transparent shadow-lg shadow-brand-secondary/20"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        )}

                        {/* Next page */}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>

                        {/* Last page */}
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
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
