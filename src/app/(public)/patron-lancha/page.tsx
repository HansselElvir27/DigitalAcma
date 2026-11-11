"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Upload, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, User, CreditCard, Camera } from "lucide-react";
import Link from "next/link";

interface Port {
    id: string;
    name: string;
}

const fallbackPorts: Port[] = [
    { id: "port_1", name: "CORTÉS" },
    { id: "port_2", name: "ROATÁN" },
    { id: "port_3", name: "LA CEIBA" },
    { id: "port_4", name: "TELA" },
    { id: "port_5", name: "UTILA" },
    { id: "port_6", name: "GUANAJA" },
    { id: "port_7", name: "TRUJILLO" },
    { id: "port_8", name: "BRUS LAGUNA" },
    { id: "port_9", name: "OMOA" },
    { id: "port_10", name: "AMAPALA" },
    { id: "port_11", name: "FERRYS Y CRUCEROS" },
    { id: "port_12", name: "PUERTO LEMPIRA" },
    { id: "port_13", name: "GUAPINOL" },
    { id: "port_14", name: "SAN LORENZO" },
    { id: "port_15", name: "JOSE SANTOS GUARDIOLA" },
    { id: "port_16", name: "PUERTO CASTILLA" },
];

export default function PatronLanchaPublicPage() {
    const [ports, setPorts] = useState<Port[]>([]);
    const [loadingPorts, setLoadingPorts] = useState(true);

    // Form fields
    const [tituloNumero, setTituloNumero] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [nacionalidad, setNacionalidad] = useState("HONDUREÑA");
    const [identidad, setIdentidad] = useState("");
    const [portId, setPortId] = useState("");

    // Archivos en base64
    const [reciboPagoBase64, setReciboPagoBase64] = useState<string | null>(null);
    const [reciboNombre, setReciboNombre] = useState<string>("");
    const [fotoCarnetBase64, setFotoCarnetBase64] = useState<string | null>(null);
    const [fotoNombre, setFotoNombre] = useState<string>("");

    // Estado de envío
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const res = await fetch("/api/public/puertos");
                if (res.ok) {
                    const data = await res.json();
                    setPorts(Array.isArray(data) && data.length > 0 ? data : fallbackPorts);
                } else {
                    setPorts(fallbackPorts);
                }
            } catch (err) {
                setPorts(fallbackPorts);
            } finally {
                setLoadingPorts(false);
            }
        };
        fetchPorts();
    }, []);

    // Conversión de archivo a Base64
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "recibo" | "foto"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) {
            alert("El archivo excede el tamaño máximo permitido (15 MB).");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (type === "recibo") {
                setReciboPagoBase64(base64String);
                setReciboNombre(file.name);
            } else {
                setFotoCarnetBase64(base64String);
                setFotoNombre(file.name);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!tituloNumero.trim() || !nombres.trim() || !apellidos.trim() || !identidad.trim() || !portId) {
            setErrorMessage("Por favor complete todos los campos obligatorios.");
            return;
        }

        if (!reciboPagoBase64) {
            setErrorMessage("Debe adjuntar la foto del recibo de pago.");
            return;
        }

        if (!fotoCarnetBase64) {
            setErrorMessage("Debe adjuntar la fotografía tamaño carnet.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/public/patron-lancha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tituloNumero: tituloNumero.trim(),
                    nombres: nombres.trim(),
                    apellidos: apellidos.trim(),
                    nacionalidad: nacionalidad.trim(),
                    identidad: identidad.trim(),
                    portId,
                    reciboPago: reciboPagoBase64,
                    fotografia: fotoCarnetBase64,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Ocurrió un error al procesar la solicitud.");
            }

            setSuccessData(result.data);
        } catch (error: any) {
            setErrorMessage(error.message || "Error al enviar la solicitud.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="glass-card p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Award className="text-brand-secondary" size={32} />
                        Emisión de Patrón de Lancha Costeras
                    </h1>
                    <p className="opacity-60 text-sm">
                        Solicitud digital para licencia / carnet de operador de embarcación menor
                    </p>
                </div>
            </div>

            {successData ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 rounded-3xl border border-emerald-500/30 text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                        <CheckCircle2 size={44} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">¡Solicitud Registrada con Éxito!</h2>
                        <p className="text-sm opacity-80 max-w-lg mx-auto">
                            Su solicitud de <strong>Patrón de Lancha Costeras</strong> ha sido enviada a la Capitanía de Puerto de{" "}
                            <span className="text-brand-secondary font-bold">{successData.port?.name}</span> para su revisión y emisión.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3 font-mono text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="opacity-50">Título Número:</span>
                            <span className="font-bold text-brand-secondary">{successData.tituloNumero}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="opacity-50">Solicitante:</span>
                            <span className="font-bold text-white">{successData.nombres} {successData.apellidos}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="opacity-50">Identidad:</span>
                            <span className="text-white">{successData.identidad}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="opacity-50">Estado:</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs uppercase">
                                Pendiente de Aprobación
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Link
                            href="/"
                            className="glass-card px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                        >
                            Volver al Inicio
                        </Link>
                        <button
                            onClick={() => {
                                setSuccessData(null);
                                setTituloNumero("");
                                setNombres("");
                                setApellidos("");
                                setIdentidad("");
                                setReciboPagoBase64(null);
                                setFotoCarnetBase64(null);
                                setReciboNombre("");
                                setFotoNombre("");
                            }}
                            className="premium-gradient px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:opacity-95 transition-all cursor-pointer"
                        >
                            Nueva Solicitud
                        </button>
                    </div>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 rounded-3xl space-y-8 border border-white/10">
                    {errorMessage && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle size={20} className="shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Datos Generales */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                            <User size={20} className="text-brand-secondary" /> Datos del Solicitante (Lanchero)
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                                    TÍTULO NÚMERO *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={tituloNumero}
                                    onChange={(e) => setTituloNumero(e.target.value)}
                                    placeholder="Ej. 0202-1989-00662"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                                    CAPITANÍA DE PUERTO *
                                </label>
                                <select
                                    required
                                    value={portId}
                                    onChange={(e) => setPortId(e.target.value)}
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none text-white cursor-pointer"
                                    disabled={loadingPorts}
                                >
                                    <option value="" disabled>Seleccione una Capitanía</option>
                                    {ports.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                                    NOMBRES *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                    placeholder="Ej. FREDY"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                                    APELLIDOS *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    placeholder="Ej. VALERIO PALACIOS"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                                    NÚMERO DE IDENTIDAD *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={identidad}
                                    onChange={(e) => setIdentidad(e.target.value)}
                                    placeholder="Ej. 0202-1989-00662"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                                    NACIONALIDAD *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nacionalidad}
                                    onChange={(e) => setNacionalidad(e.target.value)}
                                    placeholder="HONDUREÑA"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Adjuntos: Recibo y Fotografía */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                            <Upload size={20} className="text-brand-secondary" /> Documentos Adjuntos
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Recibo de Pago */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-white">
                                    <CreditCard size={18} className="text-amber-400" />
                                    <span>RECIBO DE PAGO *</span>
                                </div>
                                <p className="text-xs opacity-60">
                                    Adjunte una foto clara o comprobante del pago del trámite en Capitanía.
                                </p>
                                <label className="border-2 border-dashed border-white/20 hover:border-brand-secondary/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black/20">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "recibo")}
                                    />
                                    {reciboPagoBase64 ? (
                                        <div className="text-center text-xs text-emerald-400 font-bold space-y-1">
                                            <CheckCircle2 size={24} className="mx-auto" />
                                            <p className="truncate max-w-[200px]">{reciboNombre || "Recibo cargado"}</p>
                                            <span className="text-[10px] text-white/50 block font-normal">Haga clic para cambiar</span>
                                        </div>
                                    ) : (
                                        <div className="text-center text-xs opacity-70 space-y-1">
                                            <Upload size={22} className="mx-auto opacity-50" />
                                            <span>Subir foto del recibo</span>
                                            <span className="text-[10px] block opacity-40">JPG, PNG o PDF</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Fotografía tamaño carnet */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-white">
                                    <Camera size={18} className="text-blue-400" />
                                    <span>FOTOGRAFÍA TAMAÑO CARNET *</span>
                                </div>
                                <p className="text-xs opacity-60">
                                    Fotografía reciente del solicitante para imprimir en el carnet oficial.
                                </p>
                                <label className="border-2 border-dashed border-white/20 hover:border-brand-secondary/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black/20">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "foto")}
                                    />
                                    {fotoCarnetBase64 ? (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={fotoCarnetBase64}
                                                alt="Preview"
                                                className="w-16 h-20 object-cover rounded-lg border border-white/20 shadow"
                                            />
                                            <div className="text-left text-xs">
                                                <p className="text-emerald-400 font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={14} /> Foto cargada
                                                </p>
                                                <p className="opacity-50 text-[10px] truncate max-w-[150px]">{fotoNombre}</p>
                                                <span className="text-[10px] text-white/50 block mt-1">Cambiar foto</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-xs opacity-70 space-y-1">
                                            <Camera size={22} className="mx-auto opacity-50" />
                                            <span>Subir fotografía carnet</span>
                                            <span className="text-[10px] block opacity-40">JPG o PNG de frente</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="premium-gradient px-8 py-4 rounded-xl text-white font-bold shadow-xl hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Enviando Solicitud...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    <span>Enviar Solicitud de Patrón</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
