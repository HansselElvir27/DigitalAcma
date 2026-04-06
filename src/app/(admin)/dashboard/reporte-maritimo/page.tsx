"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Calendar, Clock, FileText, Eye, CheckCircle, Phone, Mail, Image, X, Filter } from "lucide-react";

// Mapeo de tipos de reporte a etiquetas legibles
const REPORT_TYPE_LABELS: Record<string, string> = {
    hundimiento: "Hundimiento",
    contaminacion: "Contaminación",
    polizones: "Polizones",
    trafico_mercancias: "Tráfico de Mercancías",
    actividades_sospechosas: "Actividades Sospechosas",
    busqueda_rescate: "Búsqueda y Rescate",
    naufragos: "Náufragos",
    pirateria: "Piratería",
    pesca_ilegal: "Pesca Ilegal",
    otros: "Otros"
};

export default function ReporteMaritimoAdminPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [filterType, setFilterType] = useState<string>("all");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch("/api/public/reporte-maritimo");
                const data = await res.json();
                setReports(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching maritime reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "RECEIVED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "IN_PROGRESS": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "RESOLVED": return "bg-green-500/10 text-green-500 border-green-500/20";
            default: return "bg-white/5 text-white/60 border-white/10";
        }
    };

    const getTypeColor = (type: string) => {
        const urgentTypes = ["hundimiento", "busqueda_rescate", "naufragos", "pirateria"];
        const warningTypes = ["contaminacion", "actividades_sospechosas", "pesca_ilegal"];
        
        if (urgentTypes.includes(type)) return "text-red-500 bg-red-500/10";
        if (warningTypes.includes(type)) return "text-amber-500 bg-amber-500/10";
        return "text-blue-500 bg-blue-500/10";
    };

    const filteredReports = filterType === "all" 
        ? reports 
        : reports.filter((r: any) => r.reportType?.includes(filterType));

    const uniqueTypes = Array.from(new Set(reports.flatMap((r: any) => r.reportType || [])));

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Reportes <span className="text-red-500">Marítimos</span></h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Incidentes y Alertas en Aguas Hondureñas</p>
                </div>
                <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-2">
                    <AlertTriangle size={14} /> {reports.length} Reportes Registrados
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="opacity-50" />
                    <span className="text-sm font-medium opacity-60">Filtrar por tipo:</span>
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                    <option value="all">Todos los tipos</option>
                    {uniqueTypes.map((type) => (
                        <option key={type} value={type}>
                            {REPORT_TYPE_LABELS[type] || type}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <AlertTriangle size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg opacity-60">No hay reportes marítimos registrados</p>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha Registro</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Hora</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Tipo de Reporte</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Descripción</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredReports.map((report: any, index: number) => (
                                    <motion.tr
                                        key={report.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm tracking-tight">
                                                {new Date(report.reportDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] opacity-40 font-mono tracking-tighter">{report.id.slice(-8).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">
                                                {new Date(report.reportDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {report.reportType?.map((type: string) => (
                                                    <span 
                                                        key={type}
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTypeColor(type)}`}
                                                    >
                                                        {REPORT_TYPE_LABELS[type] || type}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm opacity-80 line-clamp-2 max-w-xs">
                                                {report.description}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${getStatusColor(report.status)}`}>
                                                {report.status === "RECEIVED" && "RECIBIDO"}
                                                {report.status === "IN_PROGRESS" && "EN PROCESO"}
                                                {report.status === "RESOLVED" && "RESUELTO"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedReport(report)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-red-500 transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Detalles */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-brand-primary w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto"
                    >
                        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-red-600 shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                <AlertTriangle size={20} /> 
                                <span className="hidden sm:inline">Detalles del Reporte Marítimo</span>
                                <span className="sm:hidden">Reporte Marítimo</span>
                            </h3>
                            <button onClick={() => setSelectedReport(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors shrink-0">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* ID y Estado */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">ID de Registro</p>
                                    <p className="font-mono text-sm">{selectedReport.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Estado</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${getStatusColor(selectedReport.status)}`}>
                                        {selectedReport.status === "RECEIVED" && "RECIBIDO"}
                                        {selectedReport.status === "IN_PROGRESS" && "EN PROCESO"}
                                        {selectedReport.status === "RESOLVED" && "RESUELTO"}
                                    </span>
                                </div>
                            </div>

                            {/* Fecha y Hora */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                    <Calendar size={16} className="text-red-500" /> Fecha y Hora del Incidente
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Fecha</p>
                                        <p className="font-bold">{new Date(selectedReport.reportDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Hora</p>
                                        <p className="font-bold">{new Date(selectedReport.reportDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tipos de Reporte */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-500" /> Tipo de Información
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedReport.reportType?.map((type: string) => (
                                        <span 
                                            key={type}
                                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border ${getTypeColor(type)}`}
                                        >
                                            {REPORT_TYPE_LABELS[type] || type}
                                        </span>
                                    ))}
                                    {selectedReport.reportTypeOther && (
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border bg-white/5 text-white/80 border-white/10">
                                            Otros: {selectedReport.reportTypeOther}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                    <FileText size={16} className="text-red-500" /> Descripción
                                </h4>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                                </div>
                            </div>

                            {/* Foto */}
                            {selectedReport.photo && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Image size={16} className="text-red-500" /> Evidencia Fotográfica
                                    </h4>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <img 
                                            src={selectedReport.photo} 
                                            alt="Evidencia del incidente" 
                                            className="w-full max-h-64 object-contain rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Información de Contacto */}
                            {selectedReport.wantsContact && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Phone size={16} className="text-red-500" /> Información de Contacto
                                    </h4>
                                    <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <Phone size={18} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Contacto</p>
                                            <p className="font-bold">{selectedReport.contactInfo}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-green-500">
                                    <CheckCircle size={20} />
                                    <span className="font-bold text-sm">Reporte Recibido</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedReport(null)}
                                    className="px-6 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

