"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Calendar, Clock, FileText, CheckCircle, AlertCircle, Send, Upload, Phone, Mail } from "lucide-react";

// Tipos de información disponibles
const REPORT_TYPES = [
    { id: "hundimiento", label: "Hundimiento de buque" },
    { id: "contaminacion", label: "Contaminación" },
    { id: "polizones", label: "Polizones" },
    { id: "trafico_mercancias", label: "Tráfico de Mercancías" },
    { id: "actividades_sospechosas", label: "Actividades Sospechosas" },
    { id: "busqueda_rescate", label: "Búsqueda y Rescate" },
    { id: "naufragos", label: "Náufragos" },
    { id: "pirateria", label: "Piratería" },
    { id: "pesca_ilegal", label: "Pesca Ilegal" },
    { id: "otros", label: "Otros" }
];

export default function ReporteMaritimoPage() {
    const [formData, setFormData] = useState({
        reportDate: "",
        reportTime: "",
        reportType: [] as string[],
        reportTypeOther: "",
        description: "",
        wantsContact: false,
        contactInfo: ""
    });
    
    const [photo, setPhoto] = useState<string>("");
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPhoto(base64);
                setPhotoPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhoto("");
        setPhotoPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleCheckboxChange = (typeId: string) => {
        setFormData(prev => {
            const newTypes = prev.reportType.includes(typeId)
                ? prev.reportType.filter(t => t !== typeId)
                : [...prev.reportType, typeId];
            return { ...prev, reportType: newTypes };
        });
    };
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [trackingId, setTrackingId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.reportDate || !formData.reportTime || formData.reportType.length === 0 || !formData.description) {
            setError("Por favor complete todos los campos requeridos.");
            return;
        }

        if (formData.wantsContact && !formData.contactInfo) {
            setError("Si desea ser contactado, por favor proporcione un teléfono o correo electrónico.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/public/reporte-maritimo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportDate: `${formData.reportDate}T${formData.reportTime}:00`,
                    reportType: formData.reportType,
                    reportTypeOther: formData.reportType.includes("otros") ? formData.reportTypeOther : null,
                    description: formData.description,
                    photo: photo || null,
                    wantsContact: formData.wantsContact,
                    contactInfo: formData.contactInfo || null
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Error al procesar el reporte");
            }
            
            setSuccess(true);
            setTrackingId(data.request?.id || "");
            setFormData({
                reportDate: "",
                reportTime: "",
                reportType: [],
                reportTypeOther: "",
                description: "",
                wantsContact: false,
                contactInfo: ""
            });
            setPhoto("");
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
                <div className="w-20 h-20 rounded-[2.5rem] bg-red-600 flex items-center justify-center text-white mb-6 shadow-2xl rotate-3">
                    <AlertTriangle size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight uppercase italic text-white">Reporte <span className="text-brand-secondary text-4xl">Marítimo</span></h1>
                <p className="opacity-60 text-lg max-w-xl text-white">Reporte de incidentes y alertas en aguas Hondureñas</p>
            </motion.div>

            {/* Urgent Warning */}
            <div className="mb-8 p-6 bg-red-600/20 border border-red-500/50 rounded-2xl">
                <p className="text-sm text-red-400 font-bold leading-relaxed text-center flex items-center justify-center gap-2">
                    <AlertTriangle size={20} />
                    ESTA ES UNA ALERTA QUE PUEDE SER DE VIDA O MUERTE - REPORTE CON URGENCIA
                </p>
            </div>

            <motion.form
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 md:p-12 rounded-3xl space-y-8 relative overflow-hidden"
                onSubmit={handleSubmit}
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-2xl flex items-center gap-4 shadow-xl z-10 relative">
                        <CheckCircle size={32} />
                        <div>
                            <p className="font-bold text-lg text-green-400">Reporte Enviado Exitosamente</p>
                            <p className="opacity-80 text-sm">Su alerta ha sido recibida por CIM y será procesada inmediatamente.</p>
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

                {/* Section 1: Fecha y Hora */}
                <div className="space-y-6 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-4 flex items-center gap-2 text-white">
                        <Calendar className="text-red-500" /> Fecha y Hora del Incidente
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Fecha *</label>
                            <input 
                                type="date" 
                                className="input-field bg-white/5 text-white" 
                                required 
                                value={formData.reportDate} 
                                onChange={e => setFormData({ ...formData, reportDate: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Hora *</label>
                            <input 
                                type="time" 
                                className="input-field bg-white/5 text-white" 
                                required 
                                value={formData.reportTime} 
                                onChange={e => setFormData({ ...formData, reportTime: e.target.value })} 
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Tipo de Información */}
                <div className="space-y-6 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-4 flex items-center gap-2 text-white">
                        <AlertTriangle className="text-red-500" /> Tipo de Información *
                    </h2>
                    <p className="text-sm opacity-60 text-white">Seleccione uno o más tipos de información (puede seleccionar varios)</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        {REPORT_TYPES.map((type) => (
                            <label
                                key={type.id}
                                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                                    formData.reportType.includes(type.id)
                                        ? "bg-red-500/20 border-red-500/50 text-white"
                                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={formData.reportType.includes(type.id)}
                                    onChange={() => handleCheckboxChange(type.id)}
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    formData.reportType.includes(type.id)
                                        ? "bg-red-500 border-red-500"
                                        : "border-white/30"
                                }`}>
                                    {formData.reportType.includes(type.id) && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="font-medium">{type.label}</span>
                            </label>
                        ))}
                    </div>
                    
                    {/* Other specification field */}
                    {formData.reportType.includes("otros") && (
                        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white mb-2 block">
                                Especifique otro tipo *
                            </label>
                            <input 
                                type="text" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="Describa el tipo de incidente"
                                required
                                value={formData.reportTypeOther} 
                                onChange={e => setFormData({ ...formData, reportTypeOther: e.target.value })} 
                            />
                        </div>
                    )}
                </div>

                {/* Section 3: Descripción */}
                <div className="space-y-6 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-4 flex items-center gap-2 text-white">
                        <FileText className="text-red-500" /> Descripción *
                    </h2>
                    <textarea 
                        className="input-field bg-white/5 text-white min-h-[150px]" 
                        placeholder="Proporcione una descripción detallada del incidente..."
                        required
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Section 4: Fotografía */}
                <div className="space-y-6 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-4 flex items-center gap-2 text-white">
                        <Upload className="text-red-500" /> Fotografía (Opcional)
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="incident-photo"
                        />
                        <label
                            htmlFor="incident-photo"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-red-500 hover:bg-white/5 transition-all"
                        >
                            {photoPreview ? (
                                <div className="relative w-full h-full p-2">
                                    <img
                                        src={photoPreview}
                                        alt="Foto del incidente"
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
                                    <Upload size={40} className="mb-2" />
                                    <span className="text-sm font-medium">Subir foto del incidente</span>
                                    <span className="text-xs opacity-60 mt-1">PNG, JPG hasta 10MB</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Section 5: Desea ser contactado */}
                <div className="space-y-6 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-4 flex items-center gap-2 text-white">
                        <Phone className="text-red-500" /> Información de Contacto
                    </h2>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-white opacity-80">¿Desea ser contactado?</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, wantsContact: true })}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    formData.wantsContact 
                                        ? "bg-green-500 text-white" 
                                        : "bg-white/10 text-white/60 hover:bg-white/20"
                                }`}
                            >
                                SI
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, wantsContact: false, contactInfo: "" })}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    !formData.wantsContact 
                                        ? "bg-red-500 text-white" 
                                        : "bg-white/10 text-white/60 hover:bg-white/20"
                                }`}
                            >
                                NO
                            </button>
                        </div>
                    </div>

                    {formData.wantsContact && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white mb-2 block">
                                Teléfono o Correo Electrónico *
                            </label>
                            <input 
                                type="text" 
                                className="input-field bg-white/5 text-white" 
                                placeholder="+504 9999-9999 o correo@ejemplo.com"
                                value={formData.contactInfo} 
                                onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} 
                            />
                        </div>
                    )}
                </div>

                {/* Footer Legend */}
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl relative z-10">
                    <p className="text-sm text-red-400 font-medium leading-relaxed text-center">
                        <strong>Muchas gracias por su información, la DGMM-HN recibirá los datos proporcionados y tomara las medidas necesarias que podrían incluir notificar a otras autoridades nacionales y/o extranjeras.</strong>
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed text-center mt-4">
                        De ser necesario puede contactarse con el Centro de Información Marítima por Whatsapp al número <strong>+504 8820-8428</strong> o al <strong>+504 2239-8363</strong>, también puede escribir al correo <strong>cim@marinamercante.gob.hn</strong>
                    </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4 relative z-10">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-red-600 py-6 rounded-2xl text-white font-black text-xl shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Enviar Reporte de Urgencia <Send size={24} /></>
                        )}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

