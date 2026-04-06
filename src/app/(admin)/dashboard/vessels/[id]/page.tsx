"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { VesselPermitDocument } from "@/components/VesselPermitDocument";
import { VesselDossier } from "@/components/admin/VesselDossier";
import { Loader2, ArrowLeft, FileText, ClipboardList } from "lucide-react";

export default function VesselDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [vessel, setVessel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"PERMIT" | "DOSSIER">("PERMIT");

    useEffect(() => {
        const view = searchParams.get("view");
        if (view === "expediente") {
            setActiveTab("DOSSIER");
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchVessel = async () => {
            try {
                const res = await fetch(`/api/vessels/single/${params.id}`);
                const data = await res.json();
                if (res.ok) {
                    setVessel(data);
                } else {
                    alert(data.error || "Error al cargar datos");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchVessel();
    }, [params.id]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white">
                <Loader2 size={48} className="animate-spin text-brand-secondary" />
                <p className="font-black uppercase tracking-widest text-xs opacity-50">Cargando Datos de Embarcación...</p>
            </div>
        );
    }

    if (!vessel) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <p className="font-black uppercase tracking-widest text-lg mb-4">Embarcación no encontrada</p>
                <button onClick={() => router.back()} className="text-brand-secondary font-bold underline">Volver al panel</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Navigation Header */}
            <div className="print:hidden bg-slate-900/50 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-50">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 hover:text-brand-secondary transition-colors font-bold text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Volver
                </button>
                
                {/* Tab Switcher */}
                <div className="bg-black/40 p-1 rounded-2xl border border-white/5 flex gap-1">
                    <button 
                        onClick={() => setActiveTab("PERMIT")}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "PERMIT" ? "premium-gradient text-white shadow-lg" : "opacity-40 hover:opacity-100"}`}
                    >
                        <FileText size={14} /> Permiso
                    </button>
                    <button 
                        onClick={() => setActiveTab("DOSSIER")}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "DOSSIER" ? "premium-gradient text-white shadow-lg" : "opacity-40 hover:opacity-100"}`}
                    >
                        <ClipboardList size={14} /> Expediente
                    </button>
                </div>

                <div className="text-right hidden md:block">
                    <p className="text-[9px] font-black opacity-30 uppercase">Registro</p>
                    <p className="text-[10px] font-black italic text-brand-secondary">{vessel.registrationNumber}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === "PERMIT" ? (
                    <div className="flex justify-center p-0 md:p-12">
                        <div className="w-full max-w-[210mm] shadow-2xl bg-white text-black">
                            <VesselPermitDocument vessel={vessel} />
                        </div>
                    </div>
                ) : (
                    <div className="container mx-auto px-6 pt-12">
                        <VesselDossier vessel={vessel} />
                    </div>
                )}
            </div>
        </div>
    );
}
