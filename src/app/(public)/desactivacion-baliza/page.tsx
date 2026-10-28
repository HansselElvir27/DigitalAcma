"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Satellite, Calendar, Clock, User, Mail, Ship, FileText, PenTool, CheckCircle, AlertCircle, ArrowRight, Anchor } from "lucide-react";
import { SignaturePad } from "@/components/SignaturePad";

// List of ports
const PORTS = [
    "CORTÉS",
    "ROATÁN",
    "LA CEIBA",
    "TELA",
    "UTILA",
    "GUANAJA",
    "TRUJILLO",
    "BRUS LAGUNA",
    "OMOA",
    "AMAPALA",
    "FERRYS Y CRUCEROS",
    "PUERTO LEMPIRA",
    "GUAPINOL",
    "SAN LORENZO",
    "JOSE SANTOS GUARDIOLA"
];

// Condition options
const CONDITIONS = [
    "Capitán",
    "Arrendador",
    "Propietario"
];

export default function DesactivacionBalizaPage() {
    const [formData, setFormData] = useState({
        fechaHora: "",
        nombreSolicitante: "",
        condicion: "",
        correo: "",
        nombreEmbarcacion: "",
        numeroRegistro: "",
        capitaniaPuerto: "CORTÉS",
        motivo: ""
    });
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [trackingId, setTrackingId] = useState("");
    const [error, setError] = useState("");
    const [signature, setSignature] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signature) {
            setError("La firma digital es obligatoria.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/public/desactivacion-baliza", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    signature
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Error al procesar la solicitud de desactivación de baliza");
            }
            
            // Save the tracking ID from the response
            setTrackingId(data.request?.id || "");
            setSuccess(true);
            setFormData({
                fechaHora: "",
                nombreSolicitante: "",
                condicion: "",
                correo: "",
                nombreEmbarcacion: "",
                numeroRegistro: "",
                capitaniaPuerto: "CORTÉS",
                motivo: ""
            });
            setSignature(null);
        } catch (err) {
            setError("No se pudo procesar la solicitud. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // Get current datetime in local format for default value
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mb-12 flex flex-col items-center text-center"
            >
                <div className="w-20 h-20 rounded-[2.5rem] premium-gradient flex items-center justify-center text-white mb-6 shadow-2xl rotate-3">
                    <Satellite size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight uppercase italic text-white">Desactivación de <br /><span className="text-brand-secondary text-4xl">Baliza Satelital</span></h1>
                <p className="opacity-60 text-lg max-w-xl text-white">Solicitud para desactivar el dispositivo de seguimiento satelital de su embarcación</p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-12 rounded-3xl space-y-12 relative overflow-hidden"
                onSubmit={handleSubmit}
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                {success && (
                    <div className="space-y-4 z-10 relative">
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
                            <CheckCircle size={32} />
                            <div>
                                <p className="font-bold text-lg text-green-400">Solicitud de Desactivación Enviada</p>
                                <p className="opacity-80 text-sm">Su solicitud ha sido enviada para revisión.</p>
                            </div>
                        </div>
                        
                        {/* Tracking Info */}
                        {trackingId && (
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">ID de Seguimiento</p>
                                <p className="font-mono text-lg text-brand-secondary mb-3">{trackingId}</p>
                                <p className="text-sm opacity-60 mb-4">Guarde este código para rastrear el estado de su solicitud.</p>
                                <a 
                                    href={`/consultar`}
                                    className="inline-flex items-center gap-2 text-sm text-brand-secondary hover:underline"
                                >
                                    Consultar estado <ArrowRight size={16} />
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium z-10 relative flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Section 1: Datos del Solicitante */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <User className="text-brand-secondary" /> Datos del Solicitante
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Fecha y Hora *</label>
                            <input 
                                type="datetime-local" 
                                className="input-field bg-white/5 text-white" 
                                required 
                                value={formData.fechaHora} 
                                onChange={e => setFormData({ ...formData, fechaHora: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre del Solicitante *</label>
                            <input 
                                type="text" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="Nombre completo" 
                                required 
                                value={formData.nombreSolicitante} 
                                onChange={e => setFormData({ ...formData, nombreSolicitante: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Condición *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.condicion}
                                onChange={e => setFormData({ ...formData, condicion: e.target.value })}
                                required
                            >
                                <option value="" className="text-black">Seleccione condición</option>
                                {CONDITIONS.map(cond => (
                                    <option key={cond} value={cond} className="text-black">{cond}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white flex items-center gap-1"><Mail size={12} /> Correo Electrónico *</label>
                            <input 
                                type="email" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="correo@ejemplo.com" 
                                required 
                                value={formData.correo} 
                                onChange={e => setFormData({ ...formData, correo: e.target.value })} 
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Datos de la Embarcación */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Ship className="text-brand-secondary" /> Datos de la Embarcación
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre de la Embarcación *</label>
                            <input 
                                type="text" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="Nombre de la embarcación" 
                                required 
                                value={formData.nombreEmbarcacion} 
                                onChange={e => setFormData({ ...formData, nombreEmbarcacion: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Número de Registro *</label>
                            <input 
                                type="text" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="Número de registro/matrícula" 
                                required 
                                value={formData.numeroRegistro} 
                                onChange={e => setFormData({ ...formData, numeroRegistro: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Capitanía de Puerto *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.capitaniaPuerto}
                                onChange={e => setFormData({ ...formData, capitaniaPuerto: e.target.value })}
                                required
                            >
                                {PORTS.map(port => (
                                    <option key={port} value={port} className="text-black">{port}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Motivo */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <FileText className="text-brand-secondary" /> Motivo de la Desactivación
                    </h2>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Descripción del Motivo *</label>
                        <textarea
                            className="input-field bg-white/5 text-white min-h-[120px]"
                            placeholder="Describa el motivo por el cual solicita la desactivación de la baliza satelital..."
                            required
                            value={formData.motivo}
                            onChange={e => setFormData({ ...formData, motivo: e.target.value })}
                        />
                    </div>
                </div>

                {/* Section 4: Firma */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <PenTool className="text-brand-secondary" /> Firma del Solicitante
                    </h2>

                    <SignaturePad onSave={setSignature} />
                </div>

                {/* Legal Legend */}
                <div className="space-y-4 relative z-10">
                    <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4">
                        <p className="text-sm text-amber-400 font-medium leading-relaxed text-justify">
                            <strong>IMPORTANTE:</strong> Quedando entendido que se deberá reanudar las transmisiones previo a zarpar o antes de realizar cualquier movimiento de la embarcación. En caso de incumplimiento que se proceda conforme a derecho. 
                            <strong>Acuerdo DGMM/002/2007</strong> y <strong>Acuerdo DGMM/29/2011</strong>.
                        </p>
                        <p className="text-sm text-amber-400 font-medium leading-relaxed text-justify">
                            En virtud de lo anterior, para este proceso de desactivación pagare la cantidad de <strong>Doscientos Lempiras (Lps. 200.00)</strong>. 
                            <strong>Artículo 49</strong> de la Ley de Fortalecimiento de los Ingresos, Equidad Social y Racionalización del Gasto Público y <strong>artículo 60</strong> de su Reglamento.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 relative z-10">
                    <button type="submit" disabled={loading} className="w-full premium-gradient py-6 rounded-2xl text-white font-black text-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Enviar Solicitud <Anchor size={24} /></>}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

