"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Anchor, Calendar, Clock, Shield, Mail, CheckCircle, AlertCircle, FileText, Ship, Camera, ArrowRight } from "lucide-react";
import Link from "next/link";

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

// Protection levels
const PROTECTION_LEVELS = ["1", "2", "3"];

export default function AvisoArriboPage() {
    const [formData, setFormData] = useState({
        distinctiveSignal: "",
        vesselName: "",
        arrivalPort: "",
        etaDate: "",
        etaTime: "",
        protectionLevel: "",
        email: ""
    });
    
    const [vesselPhoto, setVesselPhoto] = useState<string>("");
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setVesselPhoto(base64);
                setPhotoPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setVesselPhoto("");
        setPhotoPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [trackingId, setTrackingId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.distinctiveSignal || !formData.arrivalPort || !formData.etaDate || 
            !formData.etaTime || !formData.protectionLevel || !formData.email) {
            setError("Todos los campos son requeridos.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/public/aviso-arribo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    distinctiveSignal: formData.distinctiveSignal,
                    vesselName: formData.vesselName,
                    arrivalPort: formData.arrivalPort,
                    etaDate: `${formData.etaDate}T${formData.etaTime}:00`,
                    protectionLevel: formData.protectionLevel,
                    email: formData.email,
                    vesselPhoto: vesselPhoto || null
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Error al procesar el aviso de arribo");
            }
            
            setSuccess(true);
            setTrackingId(data.request?.id || "");
            setFormData({
                distinctiveSignal: "",
                vesselName: "",
                arrivalPort: "",
                etaDate: "",
                etaTime: "",
                protectionLevel: "",
                email: ""
            });
            setVesselPhoto("");
            setPhotoPreview("");
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
                    <Anchor size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight uppercase italic text-white">Aviso Internacional <br /><span className="text-brand-secondary text-4xl">de Arribo</span></h1>
                <p className="opacity-60 text-lg max-w-xl text-white">Comercial --notificación Obligatoria</p>
            </motion.div>

            {/* Warning Legend */}
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <p className="text-sm text-red-400 font-medium leading-relaxed text-center">
                    <strong>IMPORTANTE:</strong> LA NOTIFICACIÓN DEBE REALIZARSE CON <strong>72 HORAS</strong> DE ANTICIPACIÓN.
                </p>
            </div>

            {/* Link to Recreational Form - MOVED TO TOP */}
            <div className="mb-12 p-6 glass-card border border-brand-secondary/30 rounded-3xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-brand-secondary/5 group-hover:bg-brand-secondary/10 transition-colors pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                    <div className="text-left">
                        <p className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                            <Ship className="text-brand-secondary" size={24} /> ¿Embarcación de Recreo?
                        </p>
                        <p className="opacity-60 text-sm max-w-xl">Si su embarcación es internacional de uso recreativo (yate, velero, etc.), use este formulario.</p>
                    </div>
                    <Link 
                        href="/aviso-arribo-recreativo" 
                        className="whitespace-nowrap flex items-center gap-2 px-8 py-4 premium-gradient rounded-xl text-white font-bold hover:scale-105 transition-all shadow-xl shadow-brand-secondary/20"
                    >
                        Aviso de Arribo Recreativo <ArrowRight size={20} />
                    </Link>
                </div>
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
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-2xl flex items-center gap-4 shadow-xl z-10 relative">
                        <CheckCircle size={32} />
                        <div>
                            <p className="font-bold text-lg text-green-400">Aviso de Arribo Enviado Exitosamente</p>
                            <p className="opacity-80 text-sm">Su notificación ha sido recibida por CIM.</p>
                            {trackingId && (
                                <p className="mt-2 font-mono text-sm">ID de Seguimiento: <span className="font-bold">{trackingId}</span></p>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium z-10 relative flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Section 1: Datos del Buque */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Anchor className="text-brand-secondary" /> Datos del Buque
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Señal Distintiva *</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Señal Distintiva del buque" required value={formData.distinctiveSignal} onChange={e => setFormData({ ...formData, distinctiveSignal: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre del Buque</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre del buque" value={formData.vesselName} onChange={e => setFormData({ ...formData, vesselName: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Section 1.5: Foto de la Embarcación */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Camera className="text-brand-secondary" /> Foto de la Embarcación
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="vessel-photo"
                        />
                        <label
                            htmlFor="vessel-photo"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-brand-secondary hover:bg-white/5 transition-all"
                        >
                            {photoPreview ? (
                                <div className="relative w-full h-full p-2">
                                    <img
                                        src={photoPreview}
                                        alt="Foto de la embarcación"
                                        className="w-full h-full object-contain rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemovePhoto();
                                        }}
                                        className="absolute top-4 right-4 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-white/60">
                                    <Camera size={40} className="mb-2" />
                                    <span className="text-sm font-medium">Subir foto de la embarcación</span>
                                    <span className="text-xs opacity-60 mt-1">PNG, JPG hasta 10MB</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Section 2: Puerto y ETA */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Calendar className="text-brand-secondary" /> Puerto y Hora Estimada de Arribo
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Puerto de Arribo *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.arrivalPort}
                                onChange={e => setFormData({ ...formData, arrivalPort: e.target.value })}
                                required
                            >
                                <option value="" className="text-black">Seleccione puerto</option>
                                {PORTS.map(port => (
                                    <option key={port} value={port} className="text-black">{port}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Fecha ETA *</label>
                            <input type="date" className="input-field bg-white/5 text-white" required value={formData.etaDate} onChange={e => setFormData({ ...formData, etaDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Hora ETA *</label>
                            <input type="time" className="input-field bg-white/5 text-white" required value={formData.etaTime} onChange={e => setFormData({ ...formData, etaTime: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Section 3: Nivel de Protección */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Shield className="text-brand-secondary" /> Nivel de Protección
                    </h2>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nivel Actual de Protección del Buque *</label>
                        <div className="flex gap-4 mt-4">
                            {PROTECTION_LEVELS.map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, protectionLevel: level })}
                                    className={`flex-1 py-4 rounded-xl text-xl font-black tracking-widest transition-all ${
                                        formData.protectionLevel === level 
                                            ? 'premium-gradient text-white shadow-lg' 
                                            : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                    }`}
                                >
                                    Nivel {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 4: Contacto */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Mail className="text-brand-secondary" /> Información de Contacto
                    </h2>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white flex items-center gap-1"><Mail size={12} /> Correo Electrónico *</label>
                        <input type="email" className="input-field bg-white/5 text-white" placeholder="correo@ejemplo.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                </div>

                {/* Footer Legend */}
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl relative z-10">
                    <p className="text-sm text-amber-400 font-medium leading-relaxed text-center">
                        <strong>NOTA:</strong> Este aviso es exclusivamente para buques comerciales con arrive internacional. 
                        La notificación debe realizarse con al menos 72 horas de anticipación al arrive previsto.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6 relative z-10">
                    <button type="submit" disabled={loading} className="w-full premium-gradient py-6 rounded-2xl text-white font-black text-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Enviar Aviso de Arribo <FileText size={24} /></>}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

