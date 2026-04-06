import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
import { ShieldCheck, ShieldAlert, Ship, Anchor, User, Calendar, Clock, XCircle, CheckCircle, MapPin, Radio, Info } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function VerificarVesselPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const vessel = await prisma.vesselRegistration.findUnique({
        where: { id },
        include: { port: true }
    });

    const isValid = !!vessel;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Verification Result Card */}
                <div className={`rounded-3xl overflow-hidden shadow-2xl border-4 ${isValid ? 'border-blue-500 bg-blue-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    {/* Header */}
                    <div className={`p-8 text-white flex items-center justify-center gap-4 ${isValid ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {isValid ? (
                            <>
                                <CheckCircle size={48} />
                                <h1 className="text-3xl font-black uppercase tracking-wider text-center line-clamp-2">Permiso de Navegación Válido</h1>
                            </>
                        ) : (
                            <>
                                <XCircle size={48} />
                                <h1 className="text-3xl font-black uppercase tracking-wider">Permiso Inválido</h1>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {isValid ? (
                            <>
                                {/* Valid Document Details */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-blue-400 mb-4">
                                        <ShieldCheck size={24} />
                                        <span className="font-bold">Embarcación registrada y autorizada</span>
                                    </div>

                                    <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">No. Matrícula</p>
                                                <p className="font-mono font-bold text-white text-lg">{vessel.registrationNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Estado</p>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-widest">
                                                    VIGENTE
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white mb-1">Nombre de la Embarcación</p>
                                            <p className="text-xl font-bold text-white uppercase italic">{vessel.vesselName}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white text-[9px]">Propietario</p>
                                                <p className="font-bold text-white text-xs uppercase">{vessel.ownerName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white text-[9px]">Puerto</p>
                                                <p className="font-bold text-white text-xs uppercase">{vessel.port.name}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white text-[9px]">Tipo / Actividad</p>
                                                <p className="font-bold text-white text-xs uppercase">{vessel.vesselType} / {vessel.activityType}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white text-[9px]">Año</p>
                                                <p className="font-bold text-white text-xs">{vessel.yearBuilt || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-2 rounded-lg">
                                                <p className="text-[8px] font-bold uppercase tracking-widest opacity-50 text-white">Emisión</p>
                                                <p className="font-bold text-white text-[10px] flex items-center gap-1">
                                                    <Calendar size={10} /> {vessel.issueDate ? new Date(vessel.issueDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-red-400">Expiración</p>
                                                <p className="font-bold text-red-300 text-[10px] flex items-center gap-1">
                                                    <Clock size={10} /> {vessel.expirationDate ? new Date(vessel.expirationDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1">
                                            <Info size={12} /> Observaciones
                                        </p>
                                        <p className="text-[10px] text-white/70 italic">
                                            {vessel.observations || "Sin observaciones adicionales registradas."}
                                        </p>
                                    </div>

                                    <p className="text-center text-white/40 text-[9px] uppercase tracking-widest">
                                        Validación Electrónica Oficial - DGMM Honduras
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Invalid Document Message */}
                                <div className="space-y-6 text-center">
                                    <div className="flex items-center justify-center gap-3 text-red-400 mb-4">
                                        <ShieldAlert size={48} className="mx-auto" />
                                    </div>

                                    <div className="bg-white/10 rounded-2xl p-6">
                                        <p className="text-white text-lg font-bold mb-2">
                                            Permiso No Encontrado
                                        </p>
                                        <p className="text-white/60 text-sm">
                                            No existe ningún permiso de navegación registrado con el código proporcionado.
                                        </p>
                                    </div>

                                    <p className="text-center text-white/40 text-xs">
                                        Por favor verifique la autenticidad del documento físico o contacte a la Capitanía de Puerto.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-black/20 p-4 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">
                            Dirección General de la Marina Mercante • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
