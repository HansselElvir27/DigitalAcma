"use client";

import { useState, useRef } from "react";
import { Clock, CheckCircle, AlertCircle, Eye, X, Check, FileText, Briefcase, Building2, Globe, Zap, Clock as Clock2, Minus, Paperclip, PenTool, Download, Upload, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const priorityLabel: Record<string, { label: string; color: string }> = {
    IMMEDIATE: { label: "Prioridad Inmediata", color: "text-red-400 border-red-500/30 bg-red-500/10" },
    "48H": { label: "48 Horas", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    NONE: { label: "Sin Prioridad", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
};

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function RequestsTable({ requests }: { requests: any[] }) {
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [response, setResponse] = useState("");
    const [responseFiles, setResponseFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        setResponseFiles(prev => [...prev, ...newFiles]);
        // Reset input so same file can be added again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeResponseFile = (index: number) => {
        setResponseFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateStatus = async (id: string, status: string) => {
        setLoading(true);
        try {
            // Convert files to base64
            let responseAttachments: { name: string; size: number; type: string; data: string }[] | undefined;
            if (responseFiles.length > 0) {
                responseAttachments = await Promise.all(
                    responseFiles.map(async (file) => ({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        data: await fileToBase64(file),
                    }))
                );
            }

            const res = await fetch(`/api/requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    type: "INFO",
                    officialResponse: response || undefined,
                    responseAttachments: responseAttachments ? JSON.stringify(responseAttachments) : undefined,
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error en servidor");
            }

            router.refresh();
            setSelectedReq(null);
            setResponse("");
            setResponseFiles([]);
        } catch (error: any) {
            console.error("Failed to update status", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Parse attachments JSON
    const parseAttachments = (raw: string | null) => {
        if (!raw) return [];
        try { return JSON.parse(raw); } catch { return []; }
    };

    return (
        <>
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha / ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Remitente</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Asunto</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Prioridad</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center opacity-40 text-sm">No hay solicitudes registradas</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedReq(req)}>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm tracking-tight">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] opacity-40 font-mono tracking-tighter">{req.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{req.user?.name || "Sin Nombre"}</p>
                                            <p className="text-xs opacity-60">{req.position || req.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-sm opacity-80 max-w-xs truncate" title={req.subject}>
                                            {req.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.priority && priorityLabel[req.priority] ? (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest border ${priorityLabel[req.priority].color}`}>
                                                    {priorityLabel[req.priority].label}
                                                </span>
                                            ) : <span className="opacity-30 text-xs">—</span>}
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
                            className="bg-brand-primary w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between premium-gradient">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                    <FileText size={20} /> Detalle de Solicitud
                                </h3>
                                <button onClick={() => { setSelectedReq(null); setResponseFiles([]); setResponse(""); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-6 overflow-y-auto">

                                {/* Datos del solicitante */}
                                <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Nombre Completo</p>
                                        <p className="font-bold text-sm">{selectedReq.user?.name}</p>
                                        <p className="text-xs opacity-60">{selectedReq.user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">ID de Seguimiento</p>
                                        <p className="font-mono text-sm opacity-80">{selectedReq.id}</p>
                                        <p className="text-xs opacity-60">{new Date(selectedReq.createdAt).toLocaleString()}</p>
                                    </div>
                                    {selectedReq.position && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1"><Briefcase size={10} /> Cargo</p>
                                            <p className="text-sm font-semibold">{selectedReq.position}</p>
                                        </div>
                                    )}
                                    {selectedReq.institution && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1"><Building2 size={10} /> Institución</p>
                                            <p className="text-sm font-semibold">{selectedReq.institution}</p>
                                        </div>
                                    )}
                                    {selectedReq.country && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1"><Globe size={10} /> País</p>
                                            <p className="text-sm font-semibold">{selectedReq.country}</p>
                                        </div>
                                    )}
                                    {selectedReq.priority && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Prioridad</p>
                                            {priorityLabel[selectedReq.priority] && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border ${priorityLabel[selectedReq.priority].color}`}>
                                                    {priorityLabel[selectedReq.priority].label}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Asunto */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Asunto</p>
                                    <p className="font-bold text-lg">{selectedReq.subject}</p>
                                </div>

                                {/* Mensaje */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Mensaje / Detalles</p>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-sm leading-relaxed opacity-90 whitespace-pre-wrap">
                                        {selectedReq.message}
                                    </div>
                                </div>

                                {/* Adjuntos del solicitante */}
                                {(() => {
                                    const files = parseAttachments(selectedReq.attachments);
                                    return files.length > 0 ? (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-1"><Paperclip size={10} /> Archivos Adjuntos ({files.length})</p>
                                            <div className="space-y-2">
                                                {files.map((f: any, i: number) => {
                                                    const isString = typeof f === 'string';
                                                    const rawUrl = isString ? f : f.data;
                                                    const fileName = isString ? (f.split('/').pop() || `Archivo ${i+1}`) : f.name;
                                                    const url = rawUrl?.startsWith('/uploads/') ? `/api${rawUrl}` : rawUrl;

                                                    return (
                                                        <a
                                                            key={i}
                                                            href={url}
                                                            download={fileName}
                                                            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Paperclip size={14} className="opacity-40 flex-shrink-0" />
                                                                <span className="font-medium truncate max-w-xs">{fileName}</span>
                                                            </div>
                                                            <Download size={16} className="text-brand-secondary opacity-60 flex-shrink-0 ml-2" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                {/* Firma Digital */}
                                {selectedReq.signature && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-1"><PenTool size={10} /> Firma Digital del Solicitante</p>
                                        <div className="p-4 bg-white rounded-2xl border border-white/10 flex justify-center">
                                            <img src={selectedReq.signature?.startsWith('/uploads/') ? `/api${selectedReq.signature}` : selectedReq.signature} alt="Firma digital" className="max-h-24 object-contain" />
                                        </div>
                                    </div>
                                )}

                                {/* ===================== Formulario de Respuesta (PENDING / REVIEWING) ===================== */}
                                {selectedReq.status === 'PENDING' || selectedReq.status === 'REVIEWING' ? (
                                    <div className="space-y-4 p-5 bg-white/3 border border-white/8 rounded-2xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1">
                                            <FileText size={10} /> Respuesta Oficial (CIM)
                                        </p>

                                        {/* Textarea */}
                                        <textarea
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            placeholder="Escriba aquí la respuesta oficial para el ciudadano..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-brand-secondary outline-none transition-colors min-h-[120px] resize-none"
                                        />

                                        {/* Área de adjuntar archivos */}
                                        <div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                className="hidden"
                                                id="response-file-input"
                                                onChange={handleFileChange}
                                            />
                                            <label
                                                htmlFor="response-file-input"
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-brand-secondary/60 hover:bg-brand-secondary/5 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-all w-fit"
                                            >
                                                <Upload size={14} />
                                                Adjuntar archivos a la respuesta
                                            </label>
                                        </div>

                                        {/* Lista de archivos seleccionados */}
                                        {responseFiles.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                                    {responseFiles.length} archivo{responseFiles.length !== 1 ? "s" : ""} seleccionado{responseFiles.length !== 1 ? "s" : ""}
                                                </p>
                                                {responseFiles.map((file, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                                        <div className="flex items-center gap-2 text-sm min-w-0">
                                                            <Paperclip size={13} className="opacity-40 flex-shrink-0" />
                                                            <span className="font-medium truncate">{file.name}</span>
                                                            <span className="text-[10px] opacity-40 flex-shrink-0">{formatBytes(file.size)}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeResponseFile(i)}
                                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex-shrink-0 ml-2"
                                                            title="Eliminar archivo"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* ===================== Respuesta ya enviada ===================== */
                                    (selectedReq.officialResponse || selectedReq.responseAttachments) && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Respuesta Enviada</p>
                                            {selectedReq.officialResponse && (
                                                <div className="p-6 bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl text-sm italic">
                                                    &ldquo;{selectedReq.officialResponse}&rdquo;
                                                </div>
                                            )}
                                            {/* Archivos adjuntos de la respuesta */}
                                            {(() => {
                                                const files = parseAttachments(selectedReq.responseAttachments);
                                                return files.length > 0 ? (
                                                    <div className="mt-3">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 flex items-center gap-1">
                                                            <Paperclip size={10} /> Archivos de la Respuesta ({files.length})
                                                        </p>
                                                        <div className="space-y-2">
                                                            {files.map((f: any, i: number) => (
                                                                <a
                                                                    key={i}
                                                                    href={f.data}
                                                                    download={f.name}
                                                                    className="flex items-center justify-between p-3 bg-brand-secondary/5 rounded-xl border border-brand-secondary/20 hover:bg-brand-secondary/10 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Paperclip size={14} className="text-brand-secondary opacity-60 flex-shrink-0" />
                                                                        <span className="font-medium truncate max-w-xs">{f.name}</span>
                                                                        {f.size && <span className="text-[10px] opacity-40">{formatBytes(f.size)}</span>}
                                                                    </div>
                                                                    <Download size={16} className="text-brand-secondary flex-shrink-0 ml-2" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Actions / Footer */}
                            {(selectedReq.status === 'PENDING' || selectedReq.status === 'REVIEWING') && (
                                <div className="p-6 border-t border-white/10 bg-black/20 flex items-center justify-end gap-3 mt-auto">
                                    <button
                                        disabled={loading}
                                        onClick={() => updateStatus(selectedReq.id, 'REJECTED')}
                                        className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                    >
                                        Rechazar
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={() => updateStatus(selectedReq.id, 'APPROVED')}
                                        className="px-6 py-2.5 rounded-xl bg-brand-secondary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                        Aprobar Solicitud
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
