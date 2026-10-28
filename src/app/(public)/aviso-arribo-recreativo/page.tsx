"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Anchor, Calendar, Clock, Shield, Mail, CheckCircle, AlertCircle, FileText, Ship, Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

// List of countries
const COUNTRIES = [
    "Honduras",
    "Estados Unidos",
    "México",
    "Belice",
    "Guatemala",
    "El Salvador",
    "Nicaragua",
    "Costa Rica",
    "Panamá",
    "Colombia",
    "Venezuela",
    "Brasil",
    "Argentina",
    "Chile",
    "Perú",
    "Ecuador",
    "Cuba",
    "Jamaica",
    "República Dominicana",
    "Puerto Rico",
    "Islas Caimán",
    "Islas Vírgenes",
    "Reino Unido",
    "España",
    "Francia",
    "Italia",
    "Alemania",
    "Países Bajos",
    "Bélgica",
    "Portugal",
    "Canadá",
    "Australia",
    "Nueva Zelanda",
    "Sudáfrica",
    "Otro"
];

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

// Vessel types
const VESSEL_TYPES = [
    "Perca recreacional",
    "Velero",
    "Exploración",
    "Yate",
    "Catamarán",
    "Lancha",
    "Otro"
];

export default function AvisoArriboRecreativoPage() {
    const [formData, setFormData] = useState({
        vesselName: "",
        registrationNum: "",
        flag: "",
        departurePort: "",
        vesselType: "",
        countryOrigin: "",
        arrivalPort: "",
        etaDate: "",
        etaTime: "",
        personsOnBoard: "",
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

        if (!formData.vesselName || !formData.registrationNum || !formData.flag || 
            !formData.departurePort || !formData.vesselType || !formData.countryOrigin || 
            !formData.arrivalPort || !formData.etaDate || !formData.etaTime || 
            !formData.personsOnBoard || !formData.email) {
            setError("Todos los campos son requeridos.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/public/aviso-arribo-recreativo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vesselName: formData.vesselName,
                    registrationNum: formData.registrationNum,
                    flag: formData.flag,
                    departurePort: formData.departurePort,
                    vesselType: formData.vesselType,
                    countryOrigin: formData.countryOrigin,
                    arrivalPort: formData.arrivalPort,
                    etaDate: `${formData.etaDate}T${formData.etaTime}:00`,
                    personsOnBoard: formData.personsOnBoard,
                    email: formData.email,
                    vesselPhoto: vesselPhoto || null
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Error al procesar el aviso de arrivalo");
            }
            
            setSuccess(true);
            setTrackingId(data.request?.id || "");
            setFormData({
                vesselName: "",
                registrationNum: "",
                flag: "",
                departurePort: "",
                vesselType: "",
                countryOrigin: "",
                arrivalPort: "",
                etaDate: "",
                etaTime: "",
                personsOnBoard: "",
                email: ""
            });
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
                    <Ship size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight uppercase italic text-white">Aviso Internacional <br /><span className="text-brand-secondary text-4xl">de Arribo Recreativo</span></h1>
                <p className="opacity-60 text-lg max-w-xl text-white">Embarcaciones de Recreación --Notificación Obligatoria</p>
            </motion.div>

            {/* Navigation and Warning */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <Link 
                    href="/aviso-arribo" 
                    className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all shadow-lg group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Regresar al Aviso Comercial
                </Link>
                <div className="flex-1 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center">
                    <p className="text-sm text-red-400 font-medium leading-relaxed text-center">
                        <strong>IMPORTANTE:</strong> LA NOTIFICACIÓN DEBE REALIZARSE CON <strong>48 HORAS</strong> DE ANTICIPACIÓN.
                    </p>
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
                            <p className="opacity-80 text-sm">Su notificación ha sido recibida por CIM y Capitán de Puerto.</p>
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

                {/* Section 1: Datos de la Embarcación */}
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
                                placeholder="Nombre de la'embarcación" 
                                required 
                                value={formData.vesselName} 
                                onChange={e => setFormData({ ...formData, vesselName: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Registro o Matrícula *</label>
                            <input 
                                type="text" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="Número de registro o matrícula" 
                                required 
                                value={formData.registrationNum} 
                                onChange={e => setFormData({ ...formData, registrationNum: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Bandera *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.flag}
                                onChange={e => setFormData({ ...formData, flag: e.target.value })}
                                required
                            >
                                <option value="" className="text-black">Seleccione país de bandera</option>
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country} className="text-black">{country}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Tipo de Buque *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.vesselType}
                                onChange={e => setFormData({ ...formData, vesselType: e.target.value })}
                                required
                            >
                                <option value="" className="text-black">Seleccione tipo de buque</option>
                                {VESSEL_TYPES.map(type => (
                                    <option key={type} value={type} className="text-black">{type}</option>
                                ))}
                            </select>
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
                            id="vessel-photo-recreativo"
                        />
                        <label
                            htmlFor="vessel-photo-recreativo"
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

                {/* Section 2: Ruta y Procedencia */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Anchor className="text-brand-secondary" /> Ruta y Procedencia
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Puerto de Procedencia *</label>
                            <input 
                                type="text" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="Puerto de procedencia" 
                                required 
                                value={formData.departurePort} 
                                onChange={e => setFormData({ ...formData, departurePort: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">País de Procedencia *</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.countryOrigin}
                                onChange={e => setFormData({ ...formData, countryOrigin: e.target.value })}
                                required
                            >
                                <option value="" className="text-black">Seleccione país</option>
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country} className="text-black">{country}</option>
                                ))}
                            </select>
                        </div>
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
                    </div>
                </div>

                {/* Section 3: ETA y Tripulación */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <Calendar className="text-brand-secondary" /> Hora Estimada de Arribo
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Fecha ETA *</label>
                            <input 
                                type="date" 
                                className="input-field bg-white/5 text-white" 
                                required 
                                value={formData.etaDate} 
                                onChange={e => setFormData({ ...formData, etaDate: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Hora ETA *</label>
                            <input 
                                type="time" 
                                className="input-field bg-white/5 text-white" 
                                required 
                                value={formData.etaTime} 
                                onChange={e => setFormData({ ...formData, etaTime: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Personas a Bordo *</label>
                            <textarea 
                                className="input-field bg-white/5 text-white min-h-[100px]" 
                                placeholder="Liste nombre, edad y nationality de cada persona a bordo" 
                                required 
                                value={formData.personsOnBoard} 
                                onChange={e => setFormData({ ...formData, personsOnBoard: e.target.value })}
                            />
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
                        <input 
                            type="email" 
                            className="input-field bg-white/5 text-white" 
                            placeholder="correo@ejemplo.com" 
                            required 
                            value={formData.email} 
                            onChange={e => setFormData({ ...formData, email: e.target.value })} 
                        />
                    </div>
                </div>

                {/* Footer Legend */}
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl relative z-10">
                    <p className="text-sm text-amber-400 font-medium leading-relaxed text-center">
                        <strong>NOTA:</strong> LA NOTIFICACIÓN DEBE REALIZARSE CON 48 HORAS DE ANTICIPACIÓN.
                        Este aviso será recibido por CIM y Capitán de Puerto.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6 relative z-10">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full premium-gradient py-6 rounded-2xl text-white font-black text-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Enviar Aviso de Arribo <FileText size={24} /></>}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

