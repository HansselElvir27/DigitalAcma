"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Clock, CheckCircle, AlertCircle, ArrowRight, MessageSquare, User, Paperclip, Download, Ship, Anchor, LifeBuoy } from "lucide-react";
import { ZarpeDocument } from "@/components/ZarpeDocument";

function ConsultarContent() {
    const searchParams = useSearchParams();
    const [trackingId, setTrackingId] = useState(searchParams?.get("id") || "");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [showZarpe, setShowZarpe] = useState(false);

    // Parse attachments JSON
    const parseAttachments = (raw: string | null) => {
        if (!raw) return [];
        try { return JSON.parse(raw); } catch { return []; }
    };

    // Auto-search if ?id= param is provided
    useEffect(() => {
        const idParam = searchParams?.get("id");
        if (idParam) {
            setTrackingId(idParam);
            fetch(`/api/public/tracking/${idParam}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) setError(data.error);
                    else setResult(data);
                })
                .catch(() => setError("Error al conectar con el servidor."));
        }
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingId.trim()) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`/api/public/tracking/${trackingId}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "No se encontró ninguna solicitud con ese ID");
            } else {
                setResult(data);
            }
        } catch (err) {
            setError("Error al conectar con el servidor. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-16 px-4 min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 space-y-4"
            >
                <div className="w-20 h-20 rounded-3xl premium-gradient flex items-center justify-center text-white mx-auto mb-6 shadow-2xl">
                    <Search size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight uppercase italic">Rastreo de <span className="text-brand-secondary">Solicitudes</span></h1>
                <p className="opacity-60 text-lg max-w-xl mx-auto">Ingrese su código de seguimiento para conocer el estado y ver las respuestas oficiales de la institución.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto"
            >
                <form onSubmit={handleSearch} className="relative group mb-12">
                    <input
                        type="text"
                        placeholder="Ej: clx123... o ID de Zarpe"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] py-6 px-8 text-xl focus:border-brand-secondary outline-none transition-all shadow-xl group-focus-within:shadow-brand-secondary/10"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-3 top-3 bottom-3 aspect-square premium-gradient rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowRight size={24} />}
                    </button>
                </form>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl flex items-center gap-4"
                        >
                            <AlertCircle size={24} />
                            <p className="font-bold">{error}</p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card rounded-[2.5rem] p-10 border border-white/10 shadow-2xl space-y-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Estado Actual</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest border ${result.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            result.status === 'REVIEWING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                result.status === 'PRE_APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    result.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {result.status === 'PENDING' && <AlertCircle size={14} />}
                                        {result.status === 'REVIEWING' && <Clock size={14} />}
                                        {result.status === 'PRE_APPROVED' && <CheckCircle size={14} />}
                                        {result.status === 'APPROVED' && <CheckCircle size={14} />}
                                        {result.status}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">ID de Seguimiento</p>
                                    <p className="font-mono text-sm opacity-60">{result.id}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2">Tipo</p>
                                    <p className="font-mono text-sm text-brand-secondary">{result.type || 'SOLICITUD'}</p>
                                </div>
                            </div>

                            {/* ZARPE SPECIFIC DATA */}
                            {result.type === "ZARPE" && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center shrink-0">
                                            <Ship className="text-brand-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1 font-mono">Solicitud de Zarpe</p>
                                            <h3 className="text-xl font-bold">{result.vesselName}</h3>
                                            <p className="text-sm opacity-60">Matrícula: {result.registrationNum}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 p-6 bg-white/5 rounded-2xl">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto</p>
                                            <p className="font-bold">{result.port?.name || result.portName || 'No especificado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Destino</p>
                                            <p className="font-bold text-brand-secondary">{result.destination}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha de Zarpe</p>
                                            <p className="font-bold">{new Date(result.departureDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hora</p>
                                            <p className="font-bold">{new Date(result.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>

                                    {result.status === 'APPROVED' && (
                                        <button
                                            onClick={() => setShowZarpe(true)}
                                            className="block w-full py-4 px-6 premium-gradient rounded-2xl text-white font-bold text-center shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Ship size={20} />
                                            Ver Zarpe Nacional
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* PASE SALIDA SPECIFIC DATA */}
                            {result.type === "PASE_SALIDA" && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center shrink-0">
                                            <LifeBuoy className="text-brand-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1 font-mono">Pase de Salida</p>
                                            <h3 className="text-xl font-bold">{result.vesselName}</h3>
                                            <p className="text-sm opacity-60">Matrícula: {result.registrationNum}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 p-6 bg-white/5 rounded-2xl">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto de Salida</p>
                                            <p className="font-bold">{result.departurePort}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Destino</p>
                                            <p className="font-bold text-brand-secondary">{result.destination}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha de Salida</p>
                                            <p className="font-bold">{new Date(result.departureDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hora de Salida</p>
                                            <p className="font-bold">{result.departureTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tipo de Actividad</p>
                                            <p className="font-bold">{result.activityType}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Operador</p>
                                            <p className="font-bold">{result.operatorName}</p>
                                        </div>
                                    </div>

                                    {/* Tripulación y Pasajeros */}
                                    {(result.crewList || result.passengerList) && (
                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {result.crewList && (
                                                    <div className="p-4 bg-white/5 rounded-2xl">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Tripulación</p>
                                                        <p className="text-sm">{result.crewList}</p>
                                                    </div>
                                                )}
                                                {result.passengerList && (
                                                    <div className="p-4 bg-white/5 rounded-2xl">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Pasajeros</p>
                                                        <p className="text-sm">{result.passengerList}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Guide if applicable */}
                                    {result.guideName && (
                                        <div className="p-4 bg-white/5 rounded-2xl">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Guía</p>
                                            <p className="font-bold">{result.guideName}</p>
                                        </div>
                                    )}

                                    {/* Estado Pendiente/Pre-aprobado */}
                                    {result.status !== 'APPROVED' && (
                                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Clock className="text-amber-500" size={24} />
                                                <div>
                                                    <p className="font-bold text-amber-400">Solicitud en Proceso de Aprobación</p>
                                                    <p className="text-sm opacity-60">Su pase de salida está siendo revisado por CIM y será autorizado por Capitán de Puerto.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Estado Aprobado */}
                                    {result.status === 'APPROVED' && (
                                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="text-green-500" size={24} />
                                                <div>
                                                    <p className="font-bold text-green-400">Pase de Salida Autorizado</p>
                                                    <p className="text-sm opacity-60">Su solicitud ha sido aprobada. Puede proceder con la salida de la embarcación.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CIM Comment */}
                                    {result.cimComment && (
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Observación de CIM</p>
                                            <p className="text-sm italic">"{result.cimComment}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* INFO REQUEST DATA */}
                            {result.type !== "ZARPE" && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                            <FileText className="text-brand-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1 font-mono">Asunto</p>
                                            <h3 className="text-xl font-bold">{result.subject}</h3>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                            <User className="text-brand-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1 font-mono">Remitente</p>
                                            <h3 className="font-bold">{result.user?.name}</h3>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                                            <MessageSquare size={12} /> Su Mensaje original
                                        </p>
                                        <p className="text-lg opacity-80 leading-relaxed italic">"{result.message}"</p>
                                    </div>

                                    {/* Archivos Adjuntos del solicitante */}
                                    {(() => {
                                        const files = parseAttachments(result.attachments);
                                        return files.length > 0 ? (
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-1"><Paperclip size={10} /> Archivos Adjuntos ({files.length})</p>
                                                <div className="space-y-2">
                                                    {files.map((f: any, i: number) => {
                                                        const isString = typeof f === 'string';
                                                        const data = isString ? f : f.data;
                                                        const name = isString ? (f.split('/').pop() || `Archivo ${i + 1}`) : f.name;
                                                        const href = data?.startsWith('/uploads/') ? `/api${data}` : data;
                                                        
                                                        return (
                                                            <a
                                                                key={i}
                                                                href={href}
                                                                download={name}
                                                                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Paperclip size={16} className="opacity-40 flex-shrink-0" />
                                                                    <span className="font-medium">{name}</span>
                                                                </div>
                                                                <Download size={18} className="text-brand-secondary opacity-60 flex-shrink-0" />
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            )}

                            {result.officialResponse && result.type !== "ZARPE" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 premium-gradient rounded-3xl shadow-2xl space-y-6 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
                                        <CheckCircle size={120} />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 relative z-10 flex items-center gap-2">
                                        <CheckCircle size={12} /> Respuesta Oficial de la Institución
                                    </p>
                                    <div className="space-y-4 relative z-10">
                                        <p className="text-xl font-medium text-white leading-relaxed">
                                            {result.officialResponse}
                                        </p>

                                        {/* Archivos Adjuntos de la Respuesta Oficial */}
                                        {(() => {
                                            const responseFiles = parseAttachments(result.responseAttachments);
                                            return responseFiles.length > 0 ? (
                                                <div className="pt-4 border-t border-white/10 space-y-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-1">
                                                        <Paperclip size={10} /> Documentos Adjuntos a la Respuesta ({responseFiles.length})
                                                    </p>
                                                        <div className="grid gap-2">
                                                            {responseFiles.map((f: any, i: number) => {
                                                                const isString = typeof f === 'string';
                                                                const data = isString ? f : f.data;
                                                                const name = isString ? (f.split('/').pop() || `Respuesta ${i + 1}`) : f.name;
                                                                const href = data?.startsWith('/uploads/') ? `/api${data}` : data;

                                                                return (
                                                                    <a
                                                                        key={i}
                                                                        href={href}
                                                                        download={name}
                                                                        className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/20 transition-all group"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                                                                                <Download size={14} />
                                                                            </div>
                                                                            <span className="font-bold text-sm text-white">{name}</span>
                                                                        </div>
                                                                        <ArrowRight size={18} className="text-white opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                    <p className="text-[10px] font-bold text-white/40 pt-4 relative z-10">
                                        Respondido el {new Date(result.respondedAt).toLocaleDateString()}
                                    </p>
                                </motion.div>
                            )}

                            {/* AVISO ARRIBO SPECIFIC DATA */}
                            {(result.type === "AVISO_ARRIBO" || result.type === "AVISO_ARRIBO_RECREATIVO") && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center shrink-0">
                                            {result.type === "AVISO_ARRIBO" ? <Anchor className="text-brand-secondary" /> : <Ship className="text-brand-secondary" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1 font-mono">
                                                {result.type === "AVISO_ARRIBO" ? "Aviso de Arribo Comercial" : "Aviso de Arribo Recreativo"}
                                            </p>
                                            <h3 className="text-xl font-bold">
                                                {result.type === "AVISO_ARRIBO" ? result.distinctiveSignal : result.vesselName}
                                            </h3>
                                            {result.vesselName && result.type === "AVISO_ARRIBO" && <p className="text-sm opacity-60">Buque: {result.vesselName}</p>}
                                            {result.registrationNum && <p className="text-sm opacity-60">Matrícula: {result.registrationNum}</p>}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 p-6 bg-white/5 rounded-2xl">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto de Arribo</p>
                                            <p className="font-bold">{result.arrivalPort}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">ETA (Llegada Prevista)</p>
                                            <p className="font-bold text-brand-secondary">{new Date(result.etaDate).toLocaleString()}</p>
                                        </div>
                                        {result.type === "AVISO_ARRIBO" && (
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Nivel de Protección</p>
                                                <p className="font-bold">Nivel {result.protectionLevel}</p>
                                            </div>
                                        )}
                                        {result.type === "AVISO_ARRIBO_RECREATIVO" && (
                                            <>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Bandera</p>
                                                    <p className="font-bold">{result.flag}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tipo</p>
                                                    <p className="font-bold">{result.vesselType}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Estado Aprobado / Pendiente */}
                                    {result.status === 'APPROVED' ? (
                                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="text-green-500" size={24} />
                                                <div>
                                                    <p className="font-bold text-green-400">Notificación Procesada</p>
                                                    <p className="text-sm opacity-60">Su aviso de arribo ha sido recibido y autorizado por las autoridades correspondientes.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Clock className="text-amber-500" size={24} />
                                                <div>
                                                    <p className="font-bold text-amber-400">Pendiente de Revisión</p>
                                                    <p className="text-sm opacity-60">Su notificación está siendo procesada por el Centro de Información Marítima (CIM).</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* INSCRIPCION EMBARCACION SPECIFIC DATA */}
                            {result.type === "INSCRIPCION_EMBARCACIONES" && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center shrink-0">
                                            <Ship className="text-brand-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1 font-mono">Inscripción de Embarcación</p>
                                            <h3 className="text-xl font-bold">{result.fullName}</h3>
                                            <p className="text-sm opacity-60">📱 {result.phone} &nbsp;·&nbsp; ✉️ {result.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 p-6 bg-white/5 rounded-2xl">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Capitanía de Puerto</p>
                                            <p className="font-bold">{result.port?.name || "No especificado"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha de Solicitud</p>
                                            <p className="font-bold">{new Date(result.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {result.status === 'APPROVED' && result.citaNumber ? (
                                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-3">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="text-green-500" size={24} />
                                                <div>
                                                    <p className="font-bold text-green-400">Cita Aprobada</p>
                                                    <p className="text-sm opacity-60">Su solicitud ha sido procesada. Preséntese en la capitanía para la inspección.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-500/20">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Número de Cita</p>
                                                    <p className="font-mono font-bold text-brand-secondary">{result.citaNumber}</p>
                                                </div>
                                                {result.citaDate && (
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha y Hora</p>
                                                        <p className="font-bold">{new Date(result.citaDate).toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {result.observation && (
                                                <div className="pt-3 border-t border-green-500/20">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Observaciones</p>
                                                    <p className="text-sm opacity-80">{result.observation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Clock className="text-amber-500" size={24} />
                                                <div>
                                                    <p className="font-bold text-amber-400">Pendiente de Revisión</p>
                                                    <p className="text-sm opacity-60">La Capitanía de Puerto revisará su solicitud y le asignará una fecha de inspección.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!result.officialResponse && result.type !== "ZARPE" && result.type !== "PASE_SALIDA" && result.type !== "AVISO_ARRIBO" && result.type !== "AVISO_ARRIBO_RECREATIVO" && result.type !== "INSCRIPCION_EMBARCACIONES" && (
                                <div className="p-8 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-3xl flex items-center gap-4">
                                    <Clock className="text-amber-500 animate-pulse" />
                                    <p className="text-sm font-medium opacity-60">Su solicitud está siendo procesada. Por favor, vuelva a consultar más tarde.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ZARPE DOCUMENT MODAL */}
            <AnimatePresence>
                {showZarpe && result && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white w-full max-w-5xl h-[95vh] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-6 right-6 z-[110] print:hidden">
                                <button 
                                    onClick={() => setShowZarpe(false)}
                                    className="w-12 h-12 rounded-full bg-slate-900/10 hover:bg-slate-900/20 flex items-center justify-center text-slate-900 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 md:p-12 scrollbar-premium">
                                <ZarpeDocument zarpe={result} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ConsultarPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin"></div>
            </div>
        }>
            <ConsultarContent />
        </Suspense>
    );
}

const X = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);
