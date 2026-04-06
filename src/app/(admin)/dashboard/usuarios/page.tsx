import { getPrismaClient } from "@/lib/db";

const prisma = getPrismaClient();
import { Users, Shield, MapPin, Eye } from "lucide-react";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { port: true }
    });

    const ports = await prisma.port.findMany();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                    <Users className="text-brand-secondary" size={32} />
                    Gestión de <span className="text-brand-secondary">Usuarios</span>
                </h1>
                <p className="opacity-50 text-sm font-medium tracking-wide">Administración de accesos, roles y puertos registrados</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Users Table */}
                <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center gap-2">Usuarios del Sistema</h2>
                        <button className="text-xs font-bold text-white bg-brand-secondary/20 hover:bg-brand-secondary/40 px-4 py-2 rounded-full transition-colors border border-brand-secondary/30">
                            + Nuevo Usuario
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Usuario</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Rol</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Puerto Asignado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Registro</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center opacity-40 text-sm">No hay usuarios registrados</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm tracking-tight">{user.name || "Sin Nombre"}</p>
                                                <p className="text-[10px] opacity-40 font-mono tracking-tighter">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${user.role === 'CIM' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                        user.role === 'CAPITAN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            'bg-white/5 text-white/70 border-white/10'
                                                    }`}>
                                                    <Shield size={12} />
                                                    {user.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-sm opacity-80 flex items-center gap-1.5">
                                                    <MapPin size={14} className="opacity-40" />
                                                    {user.port?.name || "N/A"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs opacity-60">
                                                {user.createdAt.toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-secondary transition-colors opacity-0 group-hover:opacity-100">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ports List */}
                <div className="glass-card flex flex-col rounded-2xl border border-white/5 shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center gap-2">Puertos</h2>
                    </div>
                    <div className="p-4 flex-1 space-y-3">
                        {ports.length === 0 ? (
                            <p className="text-center opacity-40 text-sm py-10">Sin puertos</p>
                        ) : (
                            ports.map((port) => (
                                <div key={port.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                    <p className="font-bold text-sm tracking-tight">{port.name}</p>
                                    <p className="text-xs opacity-50 mt-1 flex items-center gap-1">
                                        <MapPin size={12} /> {port.location || "Sin ubicación"}
                                    </p>
                                </div>
                            ))
                        )}
                        <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-white/20 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white hover:border-white/50 transition-colors">
                            + Agregar Puerto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
