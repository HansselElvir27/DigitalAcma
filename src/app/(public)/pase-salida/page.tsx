"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Ship, Anchor, MapPin, Calendar, Clock, User, PenTool, ClipboardCheck, Mail, CheckCircle, AlertCircle, Upload, FileText, Trash2, LifeBuoy, ArrowRight } from "lucide-react";
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

// Activity types
const ACTIVITY_TYPES = [
    "Transporte",
    "Buceo",
    "Recreativa"
];

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function PaseSalidaPage() {
    const [formData, setFormData] = useState({
        vesselName: "",
        registrationNum: "",
        departureDate: "",
        departureTime: "",
        departurePort: "CORTÉS",
        destination: "",
        operatorName: "",
        crewList: "",
        passengerList: "",
        guideName: "",
        activityType: "",
        email: ""
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
            const res = await fetch("/api/public/pase-salida", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    signature
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Error al procesar el pase de salida");
            }
            
            // Save the tracking ID from the response
            setTrackingId(data.request?.id || "");
            setSuccess(true);
            setFormData({
                vesselName: "",
                registrationNum: "",
                departureDate: "",
                departureTime: "",
                departurePort: "CORTÉS",
                destination: "",
                operatorName: "",
                crewList: "",
                passengerList: "",
                guideName: "",
                activityType: "",
                email: ""
            });
            setSignature(null);
        } catch (err) {
            setError("No se pudo procesar la solicitud. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mb-12 flex flex-col items-center text-center"
            >
                <div className="w-20 h-20 rounded-[2.5rem] premium-gradient flex items-center justify-center text-white mb-6 shadow-2xl rotate-3">
                    <LifeBuoy size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight uppercase italic text-white">Solicitud de Pase <br /><span className="text-brand-secondary text-4xl">de Salida</span></h1>
                <p className="opacity-60 text-lg max-w-xl text-white">Embarcaciones Náuticas o Deportivas - Máximo 2 millas náuticas</p>
            </motion.div>

            {/* Warning Legend */}
            <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <p className="text-sm text-amber-400 font-medium leading-relaxed text-center">
                    <strong>IMPORTANTE:</strong> Este formulario es exclusivo para las actividades náutico recreativas comerciales o no comerciales 
                    así como del transporte informal con un alejamiento máximo de <strong>2 millas náuticas</strong>. 
                    Si su actividad o destino es mayor a 2 millas náuticas deberá presentar el zarpe correspondiente, 
                    por lo que de ser encontrado fuera del límite establecido por este documento dará lugar a las multas correspondientes. 
                    Las motos acuáticas podrán desplazarse hasta <strong>1/2 milla náutica</strong>.
                </p>
            </div>

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
                                <p className="font-bold text-lg text-green-400">Solicitud de Pase de Salida Exitosa</p>
                                <p className="opacity-80 text-sm">El permiso ha sido enviado para revisión.</p>
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

                {/* Section 1: Datos de la Embarcación */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Ship className="text-brand-secondary" /> Datos de la Embarcación
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre de la Embarcación *</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre de la embarcacion" required value={formData.vesselName} onChange={e => setFormData({ ...formData, vesselName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Matrícula *</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Numero de matricula" required value={formData.registrationNum} onChange={e => setFormData({ ...formData, registrationNum: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Fecha, Hora y Ruta */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <MapPin className="text-brand-secondary" /> Fecha, Hora y Ruta
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Fecha de Salida *</label>
                            <input type="date" className="input-field bg-white/5 text-white" required value={formData.departureDate} onChange={e => setFormData({ ...formData, departureDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Hora de Salida *</label>
                            <input type="time" className="input-field bg-white/5 text-white" required value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Puerto de Salida *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.departurePort}
                                onChange={e => setFormData({ ...formData, departurePort: e.target.value })}
                                required
                            >
                                {PORTS.map(port => (
                                    <option key={port} value={port} className="text-black">{port}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Lugar de Destino *</label>
                            <textarea
                                className="input-field bg-white/5 text-white min-h-[80px]"
                                placeholder="Describe el lugar de destino"
                                required
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Operador y Tripulación */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <User className="text-brand-secondary" /> Operador y Tripulación
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre del Operador *</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre completo del operador" required value={formData.operatorName} onChange={e => setFormData({ ...formData, operatorName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Tipo de Actividad *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.activityType}
                                onChange={e => setFormData({ ...formData, activityType: e.target.value })}
                                required
                            >
                                <option value="" className="text-black">Seleccione tipo de actividad</option>
                                {ACTIVITY_TYPES.map(type => (
                                    <option key={type} value={type} className="text-black">{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre del Guía</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre del guia (opcional)" value={formData.guideName} onChange={e => setFormData({ ...formData, guideName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white flex items-center gap-1"><Mail size={12} /> Correo Electrónico *</label>
                            <input type="email" className="input-field bg-white/5 text-white" placeholder="correo@ejemplo.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Lista de Tripulantes</label>
                            <textarea
                                className="input-field bg-white/5 text-white min-h-[80px]"
                                placeholder="Nombre y cargo de los tripulantes"
                                value={formData.crewList}
                                onChange={e => setFormData({ ...formData, crewList: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Lista de Pasajeros</label>
                            <textarea
                                className="input-field bg-white/5 text-white min-h-[80px]"
                                placeholder="Nombre de los pasajeros"
                                value={formData.passengerList}
                                onChange={e => setFormData({ ...formData, passengerList: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Firma */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <PenTool className="text-brand-secondary" /> Firma del Operador
                    </h2>

                    <SignaturePad onSave={setSignature} />
                </div>

                {/* Submit Button */}
                <div className="pt-6 relative z-10">
                    <button type="submit" disabled={loading} className="w-full premium-gradient py-6 rounded-2xl text-white font-black text-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Registrar Solicitud <Anchor size={24} /></>}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

