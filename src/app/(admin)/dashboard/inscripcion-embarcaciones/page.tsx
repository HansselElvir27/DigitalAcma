"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Anchor, CalendarClock, ClipboardList, X, CheckCircle, Clock, Navigation } from "lucide-react";
import Link from "next/link";
import VesselRegistrationForm from "@/components/admin/VesselRegistrationForm";

export default function InscripcionEmbarcacionesAdminPage() {
    const [inscripciones, setInscripciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [citaDate, setCitaDate] = useState("");
    const [observation, setObservation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED">("PENDING");

    // Vessel Registration States
    const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
    const [selectedInscripcionForReg, setSelectedInscripcionForReg] = useState<any | null>(null);
    const [lastRegisteredVessel, setLastRegisteredVessel] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/public/inscripcion-embarcaciones");
            const data = await res.json();
            setInscripciones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching inscripciones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (id: string) => {
        setSelectedId(id);
        setCitaDate("");
        setObservation("");
    };

    const handleApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || !citaDate) return;

        setSubmitting(true);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const citaNumber = `CITA-${dateStr}-${randomNum}`;

        try {
            const res = await fetch(`/api/requests/inscripcion/${selectedId}/authorize`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ citaDate, observation, citaNumber }),
            });

            if (res.ok) {
                alert(`Cita aprobada. Número: ${citaNumber}`);
                setSelectedId(null);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || "Error al aprobar cita");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = inscripciones.filter(i =>
        activeTab === "PENDING" ? i.status === "PENDING" : i.status === "APPROVED"
    );

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">
                        Inscripción de <span className="text-brand-secondary">Embarcaciones</span>
                    </h1>
                    <p className="opacity-50 text-sm font-medium tracking-wide">
                        Solicitudes de inspección recibidas
                    </p>
                </div>
                <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-2">
                    <ClipboardList size={14} /> {filtered.length} Solicitudes
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(["PENDING", "APPROVED"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                            activeTab === tab
                                ? "premium-gradient text-white"
                                : "glass-card text-white/60 hover:text-white"
                        }`}
                    >
                        {tab === "PENDING" ? (
                            <><Clock size={16} className="inline mr-2" />Pendientes</>
                        ) : (
                            <><CheckCircle size={16} className="inline mr-2" />Aprobadas</>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <Ship size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg opacity-60">
                        {activeTab === "PENDING" ? "No hay solicitudes pendientes." : "No hay solicitudes aprobadas."}
                    </p>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Solicitante</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Contacto</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Fecha</th>
                                    {activeTab === "APPROVED" && (
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Nº Cita</th>
                                    )}
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((ins, i) => (
                                    <motion.tr
                                        key={ins.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm">{ins.fullName}</p>
                                            <p className="text-[10px] opacity-40 font-mono">{ins.id.slice(-8).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm">{ins.phone}</p>
                                            <p className="text-xs opacity-60 truncate max-w-[180px]">{ins.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold">{ins.port?.name || ins.portId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm">{new Date(ins.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        {activeTab === "APPROVED" && (
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-brand-secondary font-bold">{ins.citaNumber || "-"}</span>
                                                {ins.citaDate && (
                                                    <p className="text-[10px] opacity-50">{new Date(ins.citaDate).toLocaleString()}</p>
                                                )}
                                            </td>
                                        )}
                                    <td className="px-8 py-6 text-right">
                                        {activeTab === "PENDING" ? (
                                            <button
                                                onClick={() => openModal(ins.id)}
                                                className="bg-brand-secondary hover:bg-brand-primary text-white px-4 py-2 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-2 ml-auto transition-colors shadow-lg shadow-brand-secondary/20"
                                            >
                                                <CalendarClock size={14} /> AGENDAR CITA
                                            </button>
                                        ) : (
                                            <>
                                                {!ins.vesselRegistration ? (
                                                    <button
                                                      onClick={async () => {
                                                        if (ins.type === 'RENEWAL' && ins.renewalVesselId) {
                                                            try {
                                                                const res = await fetch(`/api/vessels/single/${ins.renewalVesselId}`);
                                                                const vesselData = await res.json();
                                                                setSelectedInscripcionForReg({...ins, initialVesselData: vesselData});
                                                            } catch (e) {
                                                                alert("Error al cargar datos históricos");
                                                                setSelectedInscripcionForReg(ins);
                                                            }
                                                        } else {
                                                            setSelectedInscripcionForReg(ins);
                                                        }
                                                        setRegistrationModalOpen(true);
                                                      }}
                                                      className="bg-brand-secondary hover:bg-brand-primary text-white px-4 py-2 rounded-lg text-[10px] font-black tracking-wider flex items-center gap-2 ml-auto transition-colors shadow-lg shadow-brand-secondary/20"
                                                    >
                                                        <Navigation size={14} />
                                                        {ins.type === 'RENEWAL' ? 'RENOVAR' : 'REGISTRAR'}
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col items-center md:items-end gap-1">
                                                        <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                                            {ins.type === 'RENEWAL' ? 'RENOVADA' : 'REGISTRADA'}
                                                        </span>
                                                        <Link 
                                                            href={`/dashboard/vessels/${ins.vesselRegistration.id}`}
                                                            className="text-[10px] font-bold text-brand-secondary hover:underline"
                                                        >
                                                            Ver Registro
                                                        </Link>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vessel Registration Modal (Full Screen) */}
            <AnimatePresence>
                {registrationModalOpen && selectedInscripcionForReg && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="w-full max-w-5xl"
                        >
                            <VesselRegistrationForm
                                requestId={selectedInscripcionForReg.id}
                                portId={selectedInscripcionForReg.portId}
                                citaNumber={selectedInscripcionForReg.citaNumber}
                                initialData={selectedInscripcionForReg.initialVesselData}
                                isRenewal={selectedInscripcionForReg.type === 'RENEWAL'}
                                onSuccess={(vessel) => {
                                    setLastRegisteredVessel(vessel);
                                    setRegistrationModalOpen(false);
                                    fetchData();
                                }}
                                onCancel={() => setRegistrationModalOpen(false)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Feedback Modal */}
            <AnimatePresence>
                {lastRegisteredVessel && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 p-10 rounded-3xl border border-green-500/30 text-center max-w-sm"
                        >
                            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-black mb-2 italic">¡REGISTRO EXITOSO!</h3>
                            <p className="text-sm opacity-60 mb-8">
                                La embarcación <span className="text-white font-bold">{lastRegisteredVessel.vesselName}</span> ha sido inscrita bajo el registro:
                                <br />
                                <span className="font-mono text-brand-secondary font-black text-lg">{lastRegisteredVessel.registrationNumber}</span>
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setLastRegisteredVessel(null)}
                                    className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Cerrar
                                </button>
                                <a
                                    href={`/dashboard/vessels/${lastRegisteredVessel.id}`}
                                    className="w-full block py-4 rounded-xl font-black text-xs uppercase tracking-widest premium-gradient text-white shadow-lg shadow-brand-secondary/20"
                                >
                                    Ver Permiso de Navegación
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Approval Modal */}
            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
                        >
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100 transition-opacity rounded-full hover:bg-white/5"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6 flex items-center gap-3">
                                <div className="p-3 bg-brand-secondary/20 text-brand-secondary rounded-xl">
                                    <CalendarClock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">Agendar Inspección</h3>
                                    <p className="text-xs opacity-60">
                                        Solicitante: {inscripciones.find(i => i.id === selectedId)?.fullName}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleApprove} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Fecha y Hora de Cita</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={citaDate}
                                        onChange={(e) => setCitaDate(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all outline-none"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Observaciones</label>
                                    <textarea
                                        rows={3}
                                        value={observation}
                                        onChange={(e) => setObservation(e.target.value)}
                                        placeholder="Ej: Traer documentos originales, presentarse en muelle A..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all outline-none resize-none"
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(null)}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm premium-gradient text-white shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? "Guardando..." : "Aprobar Cita"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
