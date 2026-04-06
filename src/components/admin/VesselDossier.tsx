import React from "react";
import { 
    Ship, Anchor, User, MapPin, Calendar, ClipboardList, 
    Image as ImageIcon, FileText, Activity, Maximize2, 
    Ruler, Weight, Droplets, Info, ExternalLink, Paperclip,
    History, Clock
} from "lucide-react";

interface VesselDossierProps {
    vessel: any;
}

export function VesselDossier({ vessel }: VesselDossierProps) {
    const technicalData = [
        { label: "Eslora", value: vessel.eslora, icon: <Ruler size={14} /> },
        { label: "Manga", value: vessel.manga, icon: <Maximize2 size={14} /> },
        { label: "Punta", value: vessel.punta, icon: <Maximize2 size={14} /> },
        { label: "Calado", value: vessel.calado, icon: <Droplets size={14} /> },
        { label: "TRB (Peso Bruto)", value: vessel.grossTonnage, icon: <Weight size={14} /> },
        { label: "TRN (Peso Neto)", value: vessel.netTonnage, icon: <Weight size={14} /> },
        { label: "Cap. Pasajeros", value: vessel.passengerCapacity, icon: <User size={14} /> },
        { label: "Cap. Tripulantes", value: vessel.crewCapacity, icon: <User size={14} /> },
        { label: "Tipo de Casco", value: vessel.hullMaterial, icon: <Ship size={14} /> },
        { label: "Año de Const.", value: vessel.yearBuilt, icon: <Calendar size={14} /> },
        { label: "Color Principal", value: vessel.color, icon: <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: vessel.color?.toLowerCase() }} /> },
        { label: "Ruta Habitual", value: vessel.route, icon: <MapPin size={14} /> },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Header / Summary Card */}
            <div className="glass-card rounded-[2rem] p-10 border border-white/5 relative overflow-hidden bg-slate-900/50">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Anchor size={200} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="w-24 h-24 rounded-3xl premium-gradient flex items-center justify-center text-white shadow-2xl">
                        <Ship size={48} />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2 justify-center md:justify-start">
                            <h2 className="text-3xl font-black uppercase italic tracking-tight">{vessel.vesselName}</h2>
                            <span className="bg-brand-secondary/20 text-brand-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-secondary/30">
                                {vessel.status}
                            </span>
                        </div>
                        <p className="font-mono text-brand-secondary font-black text-xl mb-6">{vessel.registrationNumber}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-60">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Tipo</p>
                                <p className="text-sm font-bold">{vessel.vesselType}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Actividad</p>
                                <p className="text-sm font-bold">{vessel.activityType}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Puerto</p>
                                <p className="text-sm font-bold">{vessel.port?.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Capitán Reg.</p>
                                <p className="text-sm font-bold">{vessel.captain?.name || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Specs & Motors */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Technical Specifications */}
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-white/10 pb-4 mb-8 flex items-center gap-2">
                            <Activity size={16} /> Especificaciones Técnicas
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
                            {technicalData.map((item, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center gap-2 mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <span className="text-brand-secondary">{item.icon}</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                                    </div>
                                    <p className="text-sm font-bold pl-5">{item.value || "-"}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Engines */}
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-white/10 pb-4 mb-8 flex items-center gap-2">
                            <Anchor size={16} /> Sistemas de Propulsión
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Marca del Motor</p>
                                <p className="text-lg font-black italic">{vessel.engineBrand || "No especificada"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Series de Motores Registrados</p>
                                <div className="flex flex-wrap gap-3">
                                    {vessel.engineSerials?.length > 0 ? (
                                        vessel.engineSerials.map((serial: string, i: number) => (
                                            <div key={i} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono font-bold">
                                                {serial}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm opacity-30 italic">No hay series registradas</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observations */}
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                            <Info size={16} /> Notas y Observaciones
                        </h3>
                        <p className="text-sm leading-relaxed opacity-60">
                            {vessel.observations || "No se registraron observaciones adicionales para este expediente."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Owner & Docs */}
                <div className="space-y-8">
                    {/* Owner Card */}
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-brand-secondary/5">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-brand-secondary/20 pb-4 mb-8 flex items-center gap-2">
                            <User size={16} /> Propietario Legal
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Nombre Completo / Razón Social</p>
                                <p className="text-base font-black uppercase">{vessel.ownerName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Identidad / RTN</p>
                                <p className="text-sm font-mono font-bold truncate">{vessel.ownerId} {vessel.rtn && `/ ${vessel.rtn}`}</p>
                            </div>
                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5"><MapPin size={14} className="text-brand-secondary" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Dirección</p>
                                        <p className="text-xs font-bold">{vessel.address || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5"><FileText size={14} className="text-brand-secondary" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Contacto</p>
                                        <p className="text-xs font-bold">{vessel.phone || "-"} / {vessel.email || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attached Documents */}
                    <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                            <Paperclip size={16} /> Documentación Adjunta
                        </h3>
                        <div className="space-y-3">
                            {vessel.paymentPhoto && (
                                <a 
                                    href={vessel.paymentPhoto} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><FileText size={16} /></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Recibo de Pago</span>
                                    </div>
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                                </a>
                            )}
                            {vessel.documents?.map((doc: string, i: number) => (
                                <a 
                                    key={i} 
                                    href={doc} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Paperclip size={16} /></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Documento #{i + 1}</span>
                                    </div>
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                                </a>
                            ))}
                            {!vessel.paymentPhoto && (!vessel.documents || vessel.documents.length === 0) && (
                                <p className="text-center py-8 text-xs opacity-20 italic">No hay documentos cargados</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bitácora de Cambios */}
            <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-brand-secondary/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-white/10 pb-6 mb-10 flex items-center gap-2">
                    <History size={16} /> Bitácora de Cambios Históricos
                </h3>
                
                <div className="space-y-6 relative ml-4">
                    <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-brand-secondary/30" />
                    
                    {vessel.history && vessel.history.length > 0 ? (
                        vessel.history.map((h: any, i: number) => (
                            <div key={i} className="relative pl-8 group">
                                <div className="absolute left-[-1.55rem] top-1 w-3 h-3 rounded-full bg-brand-secondary border-4 border-slate-900 group-hover:scale-125 transition-transform" />
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-brand-secondary/40 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-secondary mb-1">Motivo: {h.changeReason}</p>
                                            <p className="text-sm font-black italic">{new Date(h.changedAt).toLocaleDateString()} {new Date(h.changedAt).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Matrícula Anterior</p>
                                            <p className="text-xs font-mono font-bold">{h.registrationNumber}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-60 text-[10px] font-bold">
                                        <div>
                                            <span className="opacity-40 uppercase">Actividad:</span> {h.activityType}
                                        </div>
                                        <div>
                                            <span className="opacity-40 uppercase">Propietario:</span> {h.ownerName}
                                        </div>
                                        <div>
                                            <span className="opacity-40 uppercase">Eslora:</span> {h.eslora}
                                        </div>
                                        <div>
                                            <span className="opacity-40 uppercase">Año:</span> {h.yearBuilt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="relative pl-8">
                             <div className="absolute left-[-1.55rem] top-1 w-3 h-3 rounded-full bg-white/20 border-4 border-slate-900" />
                             <p className="text-xs opacity-40 italic">No se han registrado cambios históricos en este expediente.</p>
                        </div>
                    )}
                    
                    {/* Actual State is also shown as the first/current point in timeline if we want */}
                    <div className="relative pl-8 group">
                         <div className="absolute left-[-1.55rem] top-1 w-3 h-3 rounded-full bg-green-500 border-4 border-slate-900 animate-pulse" />
                         <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-1">Estado Actual</p>
                            <p className="text-sm font-black italic">{new Date(vessel.updatedAt || vessel.createdAt).toLocaleDateString()}</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Photos Gallery */}
            <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-slate-900/40 mt-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-white/10 pb-6 mb-10 flex items-center gap-2">
                    <ImageIcon size={16} /> Galería de la Embarcación
                </h3>
                {vessel.vesselPhotos?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {vessel.vesselPhotos.map((photo: string, i: number) => (
                            <div key={i} className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group cursor-pointer">
                                <img src={photo} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center opacity-20 grayscale">
                        <ImageIcon size={64} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest italic">Sin fotografías registradas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
