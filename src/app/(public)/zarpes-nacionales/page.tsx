"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Ship, Anchor, MapPin, Calendar, Clock, User, PenTool, ClipboardCheck, Mail, CheckCircle, AlertCircle, Upload, FileText, Trash2 } from "lucide-react";
import { SignaturePad } from "@/components/SignaturePad";



// List of countries (with Honduras anchored)
const COUNTRIES = [
    "HONDURAS",
    "ARGENTINA",
    "BELIZE",
    "BOLIVIA",
    "BRASIL",
    "CANADÁ",
    "CHILE",
    "COLOMBIA",
    "COSTA RICA",
    "CUBA",
    "ECUADOR",
    "EL SALVADOR",
    "ESTADOS UNIDOS",
    "GUATEMALA",
    "JAMAICA",
    "MÉXICO",
    "NICARAGUA",
    "PANAMÁ",
    "PARAGUAY",
    "PERÚ",
    "REPÚBLICA DOMINICANA",
    "URUGUAY",
    "VENEZUELA",
    "ALEMANIA",
    "ESPAÑA",
    "FRANCIA",
    "ITALIA",
    "REINO UNIDO",
    "RUSIA",
    "CHINA",
    "JAPÓN",
    "COREA DEL SUR",
    "INDIA",
    "OTRO"
];

// List of rubros
const RUBROS = [
    "Pesca",
    "Carga",
    "Remolcador",
    "Contenedor",
    "Pasajeros",
    "Crucero",
    "Tanquero",
    "Velero",
    "Militar",
    "Exploración",
    "Rescate",
    "Yate",
    "Aerodeslizador",
    "Lancha",
    "Otro"
];

// Function to convert file to base64
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

export default function ZarpesNacionales() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        vesselName: "",
        registrationNum: "",
        portName: "CORTÉS",
        destination: "",
        departureDate: "",
        departureTime: "",
        // New fields
        omiNumber: "",
        flag: "HONDURAS",
        owner: "",
        dimension: "",
        eslora: "",
        manga: "",
        puntal: "",
        tbr: "",
        tnr: "",
        rubro: "",
        balizaNumber: "",
        patent: "",
        navegabilityCert: "",
        consignee: "",
        digepescaLicense: "",
        radioFrequency: "",
        carriesOnBoard: "",
        firstOfficerName: "",
        captainLicense: "",
        firstOfficerLicense: "",
        crewList: ""
    });
    
    const [files, setFiles] = useState({
        carriesOnBoardAttachment: null as File | null,
        crewListFile: null as File | null,
        passengerListFile: null as File | null,
        paymentReceiptFile: null as File | null
    });
    
    const [signature, setSignature] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [createdId, setCreatedId] = useState("");
    const [error, setError] = useState("");
    const [databasePorts, setDatabasePorts] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const res = await fetch("/api/public/ports");
                if (res.ok) {
                    const data = await res.json();
                    setDatabasePorts(data);
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, portName: data[0].name }));
                    }
                }
            } catch (err) {
                console.error("Error fetching ports:", err);
            }
        };
        fetchPorts();
    }, []);

    const fileInputs = {
        carriesOnBoardAttachment: useRef<HTMLInputElement>(null),
        crewListFile: useRef<HTMLInputElement>(null),
        passengerListFile: useRef<HTMLInputElement>(null),
        paymentReceiptFile: useRef<HTMLInputElement>(null)
    };

    const handleFileChange = (field: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
        }
    };

    const removeFile = (field: keyof typeof files) => {
        setFiles(prev => ({ ...prev, [field]: null }));
        if (fileInputs[field].current) {
            fileInputs[field].current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signature) {
            setError("La firma digital es obligatoria.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Convert files to base64
            let carriesOnBoardAttachmentBase64: string | undefined;
            let crewListFileBase64: string | undefined;
            let passengerListFileBase64: string | undefined;
            let paymentReceiptFileBase64: string | undefined;

            if (files.carriesOnBoardAttachment) {
                carriesOnBoardAttachmentBase64 = await fileToBase64(files.carriesOnBoardAttachment);
            }
            if (files.crewListFile) {
                crewListFileBase64 = await fileToBase64(files.crewListFile);
            }
            if (files.passengerListFile) {
                passengerListFileBase64 = await fileToBase64(files.passengerListFile);
            }
            if (files.paymentReceiptFile) {
                paymentReceiptFileBase64 = await fileToBase64(files.paymentReceiptFile);
            }

            const res = await fetch("/api/public/zarpes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    signature,
                    carriesOnBoardAttachment: carriesOnBoardAttachmentBase64,
                    crewListFile: crewListFileBase64,
                    passengerListFile: passengerListFileBase64,
                    paymentReceiptFile: paymentReceiptFileBase64
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Error al procesar el zarpe");
            }
            
            setSuccess(true);
            setCreatedId(data.request.id);
            setFormData({
                name: "", email: "", vesselName: "", registrationNum: "",
                portName: "CORTÉS", destination: "", departureDate: "", departureTime: "",
                omiNumber: "", flag: "HONDURAS", owner: "", dimension: "", eslora: "", manga: "", puntal: "", tbr: "", tnr: "",
                rubro: "", balizaNumber: "", patent: "", navegabilityCert: "", consignee: "",
                digepescaLicense: "", radioFrequency: "", carriesOnBoard: "", firstOfficerName: "",
                captainLicense: "", firstOfficerLicense: "", crewList: ""
            });
            setFiles({
                carriesOnBoardAttachment: null,
                crewListFile: null,
                passengerListFile: null,
                paymentReceiptFile: null
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
                    <Ship size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight uppercase italic text-white">Solicitud de Zarpe <br /><span className="text-brand-secondary text-4xl">Nacional</span></h1>
                <p className="opacity-60 text-lg max-w-xl text-white">Autorización oficial para la salida de embarcaciones desde puertos nacionales.</p>
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
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-6 shadow-2xl z-10 relative animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle size={48} className="text-green-400" />
                        </div>
                        <div className="space-y-4">
                            <p className="font-black text-3xl uppercase italic tracking-tighter text-green-400">¡Solicitud Registrada!</p>
                            <p className="opacity-80 text-lg leading-relaxed max-w-md mx-auto">
                                Su permiso de zarpe nacional ha sido enviado a Capitanía. 
                                <br />Su código de seguimiento es:
                            </p>
                            
                            <div className="p-6 bg-green-500/20 rounded-3xl border border-green-500/30 font-mono text-2xl font-black tracking-widest text-white shadow-inner">
                                {createdId}
                            </div>
                            
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40 pt-4">Guarde este código para consultar el estado de su solicitud</p>
                        </div>
                        
                        <button 
                            type="button" 
                            onClick={() => {
                                setSuccess(false);
                                setCreatedId("");
                            }}
                            className="text-sm font-bold uppercase tracking-widest border-b border-green-500/30 hover:text-green-400 transition-colors"
                        >
                            Registrar otra solicitud
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium z-10 relative flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Section 1: Solicitante */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <User className="text-brand-secondary" /> Solicitante (Capitán o Armador)
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre Completo</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Juan Pérez" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 text-white"><Mail size={12} /> Correo Electrónico</label>
                            <input type="email" className="input-field bg-white/5 text-white" placeholder="correo@ejemplo.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Datos de la Embarcación */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <ClipboardCheck className="text-brand-secondary" /> Datos de la Embarcación
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre del Buque</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Paseo del Mar" required value={formData.vesselName} onChange={e => setFormData({ ...formData, vesselName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Matrícula No.</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="ABC-123-2024" required value={formData.registrationNum} onChange={e => setFormData({ ...formData, registrationNum: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Número OMI</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="1234567" value={formData.omiNumber} onChange={e => setFormData({ ...formData, omiNumber: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Bandera</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.flag}
                                onChange={e => setFormData({ ...formData, flag: e.target.value })}
                            >
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country} className="text-black">{country}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Propietario</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre del propietario" value={formData.owner} onChange={e => setFormData({ ...formData, owner: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Eslora</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Eslora en mts" value={formData.eslora} onChange={e => setFormData({ ...formData, eslora: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Manga</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Manga en mts" value={formData.manga} onChange={e => setFormData({ ...formData, manga: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Puntal</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Puntal en mts" value={formData.puntal} onChange={e => setFormData({ ...formData, puntal: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">TBR</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Toneladas de Registro Bruto" value={formData.tbr} onChange={e => setFormData({ ...formData, tbr: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">TNR</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Toneladas de Registro Neto" value={formData.tnr} onChange={e => setFormData({ ...formData, tnr: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Rubro</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.rubro}
                                onChange={e => setFormData({ ...formData, rubro: e.target.value })}
                            >
                                <option value="" className="text-black">Seleccione rubo</option>
                                {RUBROS.map(rubro => (
                                    <option key={rubro} value={rubro} className="text-black">{rubro}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Número de Baliza</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Número de baliza" value={formData.balizaNumber} onChange={e => setFormData({ ...formData, balizaNumber: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Patente</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Número de patente" value={formData.patent} onChange={e => setFormData({ ...formData, patent: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Certificado de Navegabilidad</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Número de certificado" value={formData.navegabilityCert} onChange={e => setFormData({ ...formData, navegabilityCert: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Section 3: Consignatario y Licencias */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <User className="text-brand-secondary" /> Consignatario y Licencias
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Consignado (Representante)</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre del consignatario" value={formData.consignee} onChange={e => setFormData({ ...formData, consignee: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Licencia DIGEPESCA</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Número de licencia DIGEPESCA" value={formData.digepescaLicense} onChange={e => setFormData({ ...formData, digepescaLicense: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Frecuencia de Radio</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Frecuencia de radio" value={formData.radioFrequency} onChange={e => setFormData({ ...formData, radioFrequency: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Section 4: Tripulación */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <User className="text-brand-secondary" /> Tripulación
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre del Capitán</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre del capitán" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Licencia Capitán</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Número de licencia" value={formData.captainLicense} onChange={e => setFormData({ ...formData, captainLicense: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Nombre Primer Oficial</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Nombre del primer oficial" value={formData.firstOfficerName} onChange={e => setFormData({ ...formData, firstOfficerName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Licencia Primer Oficial</label>
                            <input type="text" className="input-field bg-white/5 text-white" placeholder="Número de licencia" value={formData.firstOfficerLicense} onChange={e => setFormData({ ...formData, firstOfficerLicense: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Lista de Tripulantes</label>
                            <textarea
                                className="input-field bg-white/5 text-white min-h-[120px]"
                                placeholder="Ingrese la lista de tripulantes (nombre, cargo)"
                                value={formData.crewList}
                                onChange={e => setFormData({ ...formData, crewList: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: Carga y Documentos */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <FileText className="text-brand-secondary" /> Carga y Documentos
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Lleva a Bordo</label>
                            <textarea
                                className="input-field bg-white/5 text-white min-h-[80px]"
                                placeholder="Descripción de lo que lleva a bordo (carga, mercancía)"
                                value={formData.carriesOnBoard}
                                onChange={e => setFormData({ ...formData, carriesOnBoard: e.target.value })}
                            />
                        </div>

                        {/* Manifiesto de Carga file upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Manifiesto de Carga (Archivo)</label>
                            <input
                                ref={fileInputs.carriesOnBoardAttachment}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange('carriesOnBoardAttachment')}
                                className="hidden"
                                id="carriesOnBoardAttachment"
                            />
                            {files.carriesOnBoardAttachment ? (
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText size={18} className="text-brand-secondary opacity-60 flex-shrink-0" />
                                        <span className="font-medium truncate">{files.carriesOnBoardAttachment.name}</span>
                                        <span className="text-xs opacity-40 flex-shrink-0">{formatBytes(files.carriesOnBoardAttachment.size)}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile('carriesOnBoardAttachment')} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="carriesOnBoardAttachment" className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-brand-secondary/60 hover:bg-brand-secondary/5 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-all w-full justify-center">
                                    <Upload size={16} />
                                    Subir Manifiesto de Carga
                                </label>
                            )}
                        </div>

                        {/* Lista de Tripulantes file upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Lista de Tripulantes (Archivo)</label>
                            <input
                                ref={fileInputs.crewListFile}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange('crewListFile')}
                                className="hidden"
                                id="crewListFile"
                            />
                            {files.crewListFile ? (
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText size={18} className="text-brand-secondary opacity-60 flex-shrink-0" />
                                        <span className="font-medium truncate">{files.crewListFile.name}</span>
                                        <span className="text-xs opacity-40 flex-shrink-0">{formatBytes(files.crewListFile.size)}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile('crewListFile')} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="crewListFile" className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-brand-secondary/60 hover:bg-brand-secondary/5 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-all w-full justify-center">
                                    <Upload size={16} />
                                    Subir Lista de Tripulantes
                                </label>
                            )}
                        </div>

                        {/* Lista de Pasajeros file upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Lista de Pasajeros (Archivo)</label>
                            <input
                                ref={fileInputs.passengerListFile}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange('passengerListFile')}
                                className="hidden"
                                id="passengerListFile"
                            />
                            {files.passengerListFile ? (
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText size={18} className="text-brand-secondary opacity-60 flex-shrink-0" />
                                        <span className="font-medium truncate">{files.passengerListFile.name}</span>
                                        <span className="text-xs opacity-40 flex-shrink-0">{formatBytes(files.passengerListFile.size)}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile('passengerListFile')} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="passengerListFile" className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-brand-secondary/60 hover:bg-brand-secondary/5 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-all w-full justify-center">
                                    <Upload size={16} />
                                    Subir Lista de Pasajeros
                                </label>
                            )}
                        </div>

                        {/* Factura de Pago file upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Factura de Pago</label>
                            <input
                                ref={fileInputs.paymentReceiptFile}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange('paymentReceiptFile')}
                                className="hidden"
                                id="paymentReceiptFile"
                            />
                            {files.paymentReceiptFile ? (
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText size={18} className="text-brand-secondary opacity-60 flex-shrink-0" />
                                        <span className="font-medium truncate">{files.paymentReceiptFile.name}</span>
                                        <span className="text-xs opacity-40 flex-shrink-0">{formatBytes(files.paymentReceiptFile.size)}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile('paymentReceiptFile')} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="paymentReceiptFile" className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-brand-secondary/60 hover:bg-brand-secondary/5 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-all w-full justify-center">
                                    <Upload size={16} />
                                    Subir Factura de Pago
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 6: Detalles del Viaje */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <MapPin className="text-brand-secondary" /> Detalles del Viaje
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Puerto de Origen</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.portName}
                                onChange={e => setFormData({ ...formData, portName: e.target.value })}
                                required
                            >
                                {databasePorts.length > 0 ? (
                                    databasePorts.map(port => (
                                        <option key={port.id} value={port.name} className="text-black">{port.name}</option>
                                    ))
                                ) : (
                                    <option value="" disabled className="text-black">Cargando puertos...</option>
                                )}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Puerto de Destino</label>
                            <select
                                className="input-field bg-white/5 text-white"
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                required
                            >
                                <option value="" disabled className="text-black">Seleccione destino</option>
                                {databasePorts.map(port => (
                                    <option key={port.id} value={port.name} className="text-black">{port.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Fecha Estimada de Salida</label>
                            <input type="date" className="input-field bg-white/5 text-white" required value={formData.departureDate} onChange={e => setFormData({ ...formData, departureDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 text-white">Hora de Salida</label>
                            <input type="time" className="input-field bg-white/5 text-white" required value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Section 7: Firma */}
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-bold border-l-4 border-brand-secondary pl-4 flex items-center gap-2 text-white">
                        <PenTool className="text-brand-secondary" /> Firma del Capitán / Propietario
                    </h2>

                    <SignaturePad onSave={setSignature} />
                </div>

                {/* Footer Legend */}
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <p className="text-sm text-amber-400 text-center font-medium">
                        <strong>IMPORTANTE:</strong> Antes de Zarpar debe presentar la documentación respective a la autoridad marítima 
                        (Manifiesto de Carga, Lista de Tripulación, Lista de Pasajeros, Certificados de Navegación y de Tripulación) según aplique.
                    </p>
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

