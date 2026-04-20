import { getPrismaClient } from "@/lib/db";
import { ShieldCheck, ShieldAlert, Ship, MapPin, Calendar, Clock, XCircle, CheckCircle, User, Activity } from "lucide-react";

const prisma = getPrismaClient();

export const dynamic = 'force-dynamic';

export default async function VerificarPaseSalidaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const pase = await prisma.paseSalida.findUnique({
        where: { id },
        include: { user: true }
    });

    const isValid = pase && pase.status === 'APPROVED';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
            <div className="max-w-lg mx-auto">
                <div className={`rounded-3xl overflow-hidden shadow-2xl border-4 ${isValid ? 'border-brand-secondary bg-brand-secondary/10' : 'border-red-500 bg-red-500/10'}`}>
                    {/* Header */}
                    <div className={`p-8 text-white flex items-center justify-center gap-4 ${isValid ? 'bg-brand-secondary' : 'bg-red-600'}`}>
                        {isValid ? (
                            <>
                                <CheckCircle size={48} />
                                <h1 className="text-3xl font-black uppercase tracking-wider">Pase Válido</h1>
                            </>
                        ) : (
                            <>
                                <XCircle size={48} />
                                <h1 className="text-3xl font-black uppercase tracking-wider">Pase Inválido</h1>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {isValid ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-brand-secondary mb-4">
                                    <ShieldCheck size={24} />
                                    <span className="font-bold">Pase de Salida Autorizado Electrónicamente</span>
                                </div>

                                <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">No. Documento</p>
                                            <p className="font-mono font-bold text-white">{pase.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Estado</p>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                                <CheckCircle size={12} /> {pase.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white mb-1">Embarcación</p>
                                        <p className="text-xl font-bold text-white uppercase">{pase.vesselName}</p>
                                        <p className="text-xs text-white/60 font-mono">{pase.registrationNum}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Actividad</p>
                                            <p className="font-bold text-white flex items-center gap-1">
                                                <Activity size={14} className="text-brand-secondary" />
                                                {pase.activityType}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Operador</p>
                                            <p className="font-bold text-white flex items-center gap-1">
                                                <User size={14} className="text-brand-secondary" />
                                                {pase.operatorName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white mb-1">Trayecto</p>
                                        <p className="font-bold text-white flex items-center gap-2">
                                            <MapPin size={16} className="text-brand-secondary" />
                                            {pase.departurePort} ➔ {pase.destination}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Fecha de Salida</p>
                                            <p className="font-bold text-white flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(pase.departureDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">Hora</p>
                                            <p className="font-bold text-white flex items-center gap-1">
                                                <Clock size={14} />
                                                {pase.departureTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-white/60 text-sm">
                                    Este pase ha sido validado contra los registros oficiales del Sistema Digitalacma.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 text-center">
                                <div className="flex items-center justify-center gap-3 text-red-400 mb-4">
                                    <ShieldAlert size={48} className="mx-auto" />
                                </div>

                                <div className="bg-white/10 rounded-2xl p-6">
                                    <p className="text-white text-lg font-bold mb-2">
                                        {pase ? 'Pase No Autorizado' : 'Documento No Encontrado'}
                                    </p>
                                    <p className="text-white/60 text-sm">
                                        {pase 
                                            ? `El pase con ID ${id.slice(0, 8).toUpperCase()} se encuentra en estado: ${pase.status}`
                                            : 'No existe ningún pase registrado con este código de verificación'}
                                    </p>
                                </div>

                                <p className="text-center text-white/40 text-xs text-balance">
                                    Por favor contacte a la Marina Mercante si cree que esto es un error.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-black/20 p-4 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-white">
                            Marina Mercante de Honduras • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
