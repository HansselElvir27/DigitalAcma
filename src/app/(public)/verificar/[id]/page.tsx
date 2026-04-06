import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
import { ShieldCheck, ShieldAlert, Ship, MapPin, Calendar, Clock, XCircle, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function VerificarZarpePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const zarpe = await prisma.zarpeRequest.findUnique({
        where: { id },
        include: { port: true, user: true }
    });

    const isValid = zarpe && zarpe.status === 'APPROVED';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Verification Result Card */}
                <div className={`rounded-3xl overflow-hidden shadow-2xl border-4 ${isValid ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    {/* Header */}
                    <div className={`p-8 text-white flex items-center justify-center gap-4 ${isValid ? 'bg-green-600' : 'bg-red-600'}`}>
                        {isValid ? (
                            <>
                                <CheckCircle size={48} />
                                <h1 className="text-3xl font-black uppercase tracking-wider">Zarpe Válido</h1>
                            </>
                        ) : (
                            <>
                                <XCircle size={48} />
                                <h1 className="text-3xl font-black uppercase tracking-wider">Zarpe Inválido</h1>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {isValid ? (
                            <>
                                {/* Valid Document Details */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-green-400 mb-4">
                                        <ShieldCheck size={24} />
                                        <span className="font-bold">Documento autorizado por la Autoridad Marítima</span>
                                    </div>

                                    <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">No. Documento</p>
                                                <p className="font-mono font-bold text-white">{zarpe.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Estado</p>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                                    <CheckCircle size={12} /> APROBADO
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white mb-1">Embarcación</p>
                                            <p className="text-xl font-bold text-white">{zarpe.vesselName}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Matrícula</p>
                                                <p className="font-bold text-white">{zarpe.registrationNum}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Rubro</p>
                                                <p className="font-bold text-white">{zarpe.rubro || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white mb-1">Trayecto</p>
                                            <p className="font-bold text-white flex items-center gap-2">
                                                <MapPin size={16} className="text-green-400" />
                                                {zarpe.port.name} ➔ {zarpe.destination}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Fecha de Zarpe</p>
                                                <p className="font-bold text-white flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(zarpe.departureDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Hora</p>
                                                <p className="font-bold text-white flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {new Date(zarpe.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-center text-white/60 text-sm">
                                        Este documento ha sido validado electrónicamente.
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
                                            {zarpe ? 'Este zarpe no ha sido autorizado' : 'Documento no encontrado'}
                                        </p>
                                        <p className="text-white/60 text-sm">
                                            {zarpe 
                                                ? `El zarpe con ID ${id.slice(0, 8).toUpperCase()} se encuentra en estado: ${zarpe.status}`
                                                : 'No existe ningún zarpe registrado con este código'}
                                        </p>
                                        {zarpe && (
                                            <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                                <XCircle size={12} /> {zarpe.status}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-center text-white/40 text-xs">
                                        Verifique la autenticidad del documento con la Capitanía de Puerto.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-black/20 p-4 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">
                            Autoridad Marítima de Honduras • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

