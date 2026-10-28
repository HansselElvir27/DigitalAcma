"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Send, User, Mail, MessageSquare,
    CheckCircle, AlertCircle, Briefcase, Building2,
    Globe, Paperclip, Zap, Clock, Minus, PenTool, X, RotateCcw, Upload
} from "lucide-react";
import { SignaturePad } from "@/components/SignaturePad";

const COUNTRIES = [
    "Honduras",
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus",
    "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
    "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
    "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
    "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const PRIORITIES = [
    { value: "IMMEDIATE", label: "Prioridad Inmediata", icon: Zap, color: "text-red-400 border-red-500/30 bg-red-500/10" },
    { value: "48H", label: "48 Horas", icon: Clock, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    { value: "NONE", label: "Sin Prioridad", icon: Minus, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
];

export default function SolicitudInformacion() {
    const [formData, setFormData] = useState({
        name: "", email: "", subject: "", message: "",
        position: "", institution: "", country: "Honduras", priority: ""
    });
    const [signature, setSignature] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<{ name: string; data: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [requestId, setRequestId] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                setAttachments(prev => [...prev, { name: file.name, data: reader.result as string }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.priority) { setError("Seleccione una prioridad."); return; }
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/public/solicitudes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, signature, attachments })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al enviar la solicitud");
            }

            setSuccess(true);
            setRequestId(data.request.id);
            setFormData({ name: "", email: "", subject: "", message: "", position: "", institution: "", country: "Honduras", priority: "" });
            setSignature(null);
            setAttachments([]);
        } catch (err: any) {
            setError(err.message || "No se pudo procesar la solicitud. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-12 text-center">
                <div className="w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
                    <FileText size={32} />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Solicitud de Intercambio de Información</h1>
                <p className="opacity-60 text-lg">Complete el formulario para solicitar o intercambiar información oficial con la institución.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-10 rounded-3xl space-y-8">
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-8 rounded-3xl space-y-4">
                                <div className="flex items-center gap-3 font-bold text-lg">
                                    <CheckCircle size={24} />
                                    ¡Solicitud enviada exitosamente!
                                </div>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Su código de seguimiento es:</p>
                                    <p className="text-2xl font-mono font-black text-white break-all">{requestId}</p>
                                    <p className="text-xs opacity-60 pt-2">Guarde este código para consultar el estado de su trámite en la sección de "Consultar".</p>
                                </div>
                                <button onClick={() => setSuccess(false)} className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity underline">Enviar otra solicitud</button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Section 1: Datos Personales */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 border-b border-white/5 pb-3 flex items-center gap-2">
                                    <User size={14} /> Datos del Solicitante
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2 px-1"><User size={14} className="text-brand-secondary" /> Nombre Completo *</label>
                                        <input type="text" placeholder="Juan Pérez" className="input-field" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2 px-1"><Mail size={14} className="text-brand-secondary" /> Correo Electrónico *</label>
                                        <input type="email" placeholder="juan@ejemplo.com" className="input-field" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2 px-1"><Briefcase size={14} className="text-brand-secondary" /> Cargo del Solicitante</label>
                                        <input type="text" placeholder="Director, Inspector, Capitán..." className="input-field" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2 px-1"><Building2 size={14} className="text-brand-secondary" /> Institución</label>
                                        <input type="text" placeholder="Empresa o Institución" className="input-field" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2 px-1"><Globe size={14} className="text-brand-secondary" /> País *</label>
                                        <select className="input-field text-white bg-brand-primary/60" required value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                                            <option value="Honduras" className="text-black">🇭🇳 Honduras (por defecto)</option>
                                            <optgroup label="Otros países" className="text-black">
                                                {COUNTRIES.filter(c => c !== "Honduras").map(c => (
                                                    <option key={c} value={c} className="text-black">{c}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Solicitud */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 border-b border-white/5 pb-3 flex items-center gap-2">
                                    <MessageSquare size={14} /> Detalles de la Solicitud
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2 px-1"><FileText size={14} className="text-brand-secondary" /> Asunto *</label>
                                    <input type="text" placeholder="Motivo de la solicitud" className="input-field" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2 px-1"><MessageSquare size={14} className="text-brand-secondary" /> Mensaje / Detalles *</label>
                                    <textarea rows={5} placeholder="Describa su solicitud detalladamente..." className="input-field resize-none" required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}></textarea>
                                </div>
                            </div>

                            {/* Section 3: Prioridad */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 border-b border-white/5 pb-3 flex items-center gap-2">
                                    <Zap size={14} /> Prioridad *
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {PRIORITIES.map(({ value, label, icon: Icon, color }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: value })}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.priority === value ? color + ' ring-2 ring-brand-secondary scale-[1.02]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <Icon size={22} className={formData.priority === value ? '' : 'opacity-40'} />
                                            <span className="text-xs font-bold">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 4: Adjuntos */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 border-b border-white/5 pb-3 flex items-center gap-2">
                                    <Paperclip size={14} /> Archivos Adjuntos
                                </h3>
                                <label className="flex items-center justify-center gap-3 border-2 border-dashed border-white/15 rounded-2xl p-6 cursor-pointer hover:border-brand-secondary/50 hover:bg-brand-secondary/5 transition-all">
                                    <Upload size={20} className="opacity-40" />
                                    <span className="text-sm opacity-60">Haga clic para adjuntar archivos</span>
                                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
                                </label>
                                {attachments.length > 0 && (
                                    <div className="space-y-2">
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Paperclip size={14} className="opacity-40" />
                                                    <span className="font-medium truncate max-w-[250px]">{file.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeAttachment(i)} className="p-1 hover:text-red-400 transition-colors"><X size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 5: Firma Digital */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 border-b border-white/5 pb-3 flex items-center gap-2">
                                    <PenTool size={14} /> Firma Digital
                                </h3>
                                <SignaturePad onSave={setSignature} />
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button type="submit" disabled={loading} className="w-full premium-gradient py-4 rounded-xl text-white font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100">
                                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Enviar Solicitud</>}
                                </button>
                            </div>

                            {/* Official Footer */}
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <p className="text-[10px] text-center text-white/30 uppercase tracking-wider leading-relaxed font-medium">
                                    TODAS LAS SOLICITUDES SON PRELIMINARES HASTA SER RECIBIDAS POR LA AUTORIDAD COMPETENTE. CON SU NÚMERO DE SOLICITUD, PODRÁ RASTREAR EL ESTADO DE SU SOLICITUD EN ESTA PLATAFORMA.
                                </p>
                            </div>

                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
