"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Ship, AlertCircle, CheckCircle, Clock, ArrowUpRight, Bell, LifeBuoy, AlertTriangle, Eye, Phone } from "lucide-react";

export default function CIMDashboard() {
    const [statsData, setStatsData] = useState<any>(null);
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [maritimeReports, setMaritimeReports] = useState<any[]>([]);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, reqRes, reportsRes] = await Promise.all([
                    fetch("/api/stats/cim"),
                    fetch("/api/requests/recent"),
                    fetch("/api/public/reporte-maritimo")
                ]);
                const stats = await statsRes.json();
                const reqs = await reqRes.json();
                const reports = await reportsRes.json();
                setStatsData(stats);
                setRecentRequests(reqs);
                setMaritimeReports(Array.isArray(reports) ? reports : []);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: "Solicitudes Hoy", value: statsData?.solicitudesHoy ?? "--", icon: <FileText />, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Zarpes Pendientes", value: statsData?.zarpesPendientes ?? "--", icon: <Ship />, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Pases Salida Pend.", value: statsData?.paseSalidaPendientes ?? "--", icon: <LifeBuoy />, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Desact. Baliza", value: statsData?.balizaPendientes ?? "--", icon: <AlertTriangle />, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Avisos Arribo", value: statsData?.avisosArribo ?? "--", icon: <Clock />, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    // Get report type labels
    const getReportTypeLabel = (typeId: string) => {
        const labels: Record<string, string> = {
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
        return labels[typeId] || typeId;
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Dashboard <span className="text-brand-secondary">CIM</span></h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">Monitoreo y Control Marítimo Institucional</p>
                </div>
                <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> SISTEMA OPERATIVO
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-2xl flex items-center gap-6"
                    >
                        <div className={`w-14 h-14 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Urgent Alerts Section */}
            {maritimeReports.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                            <AlertTriangle size={20} /> Alertas Urgentes - Reportes Marítimos
                        </h2>
                        <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold">
                            {maritimeReports.length} Reporte{maritimeReports.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {maritimeReports.slice(0, 6).map((report, i) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-4 rounded-xl border-l-4 border-l-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer"
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={18} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] font-mono opacity-40">{report.id.slice(-8).toUpperCase()}</span>
                                </div>
                                <p className="text-sm font-bold text-white mb-1">
                                    {report.reportType.map((t: string) => getReportTypeLabel(t)).join(", ")}
                                </p>
                                <p className="text-xs text-white/60 line-clamp-2 mb-2">{report.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] opacity-40">
                                        {new Date(report.reportDate).toLocaleDateString()} {new Date(report.reportDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                                        URGENTE
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock size={20} className="text-brand-secondary" /> Solicitudes Recientes
                        </h2>
                        <button className="text-xs font-bold text-brand-secondary hover:underline cursor-pointer uppercase tracking-widest">Ver todo</button>
                    </div>

                    <div className="glass-card rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Trámite / ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Usuario / Buque</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center opacity-40 text-sm">No hay solicitudes recientes</td>
                                    </tr>
                                ) : (
                                    recentRequests.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm tracking-tight">{row.type}</p>
                                                <p className="text-[10px] opacity-40 font-mono tracking-tighter">{row.id}</p>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-sm opacity-70">{row.subject}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black tracking-widest px-2 py-1 rounded-md bg-white/5 border border-white/10 ${row.color}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                                    <ArrowUpRight size={16} className="opacity-40" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 px-2">
                        <CheckCircle size={20} className="text-brand-secondary" /> Actividad Crítica
                    </h2>
                    <div className="space-y-4">
                        {recentRequests.slice(0, 3).map((req, i) => (
                            <div key={i} className="glass-card p-4 rounded-xl border-l-4 border-l-brand-secondary flex gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Bell size={18} className="opacity-40" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold leading-tight">Actualización: {req.type} - {req.subject}</p>
                                    <p className="text-[10px] opacity-40 mt-1">Estado: {req.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de Detalles del Reporte Marítimo */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-brand-primary w-full max-w-2xl max-h-[90vh] rounded-3xl border border-red-500/30 shadow-2xl overflow-hidden my-auto"
                    >
                        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-red-600 shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                <AlertTriangle size={20} /> 
                                <span className="hidden sm:inline">Alerta de Reporte Marítimo</span>
                                <span className="sm:hidden">Reporte Marítimo</span>
                            </h3>
                            <button onClick={() => setSelectedReport(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors shrink-0">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Status Banner */}
                            <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/30 flex items-center gap-3">
                                <AlertTriangle className="text-red-500 shrink-0" size={24} />
                                <div>
                                    <p className="font-bold text-red-400">ALERTA RECIBIDA</p>
                                    <p className="text-xs text-white/60">Esta es una alerta que puede ser de vida o muerte</p>
                                </div>
                            </div>

                            {/* Report Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">ID de Registro</p>
                                    <p className="font-mono text-sm">{selectedReport.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Fecha de Reporte</p>
                                    <p className="font-bold text-sm">{new Date(selectedReport.reportDate).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Report Types */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-500" /> Tipos de Información
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedReport.reportType.map((type: string) => (
                                        <span key={type} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                                            {getReportTypeLabel(type)}
                                        </span>
                                    ))}
                                    {selectedReport.reportTypeOther && (
                                        <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs">
                                            Otros: {selectedReport.reportTypeOther}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                    <FileText size={16} className="text-brand-secondary" /> Descripción
                                </h4>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                                </div>
                            </div>

                            {/* Photo */}
                            {selectedReport.photo && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Eye size={16} className="text-brand-secondary" /> Fotografía Adjunta
                                    </h4>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <img 
                                            src={selectedReport.photo} 
                                            alt="Foto del incidente" 
                                            className="w-full max-h-64 object-contain rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            {selectedReport.wantsContact && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Phone size={16} className="text-brand-secondary" /> Información de Contacto
                                    </h4>
                                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                        <p className="text-sm text-green-400 font-bold">El reportante desea ser contactado</p>
                                        <p className="text-sm mt-1">{selectedReport.contactInfo}</p>
                                    </div>
                                </div>
                            )}

                            {/* Contact Info Request */}
                            {!selectedReport.wantsContact && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-sm text-white/60">El reportante NO desea ser contactado</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-green-500">
                                    <CheckCircle size={20} />
                                    <span className="font-bold text-sm">Alerta Recibida</span>
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
