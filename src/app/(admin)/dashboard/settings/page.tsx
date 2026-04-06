import { Settings, Lock, Mail, User, Shield } from "lucide-react";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    // For a real app we'd fetch the user using: 
    // const session = await getServerSession()
    // const user = await prisma.user.findUnique({ where: { email: session?.user?.email } })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                    <Settings className="text-brand-secondary" size={32} />
                    Configuración de <span className="text-brand-secondary">Cuenta</span>
                </h1>
                <p className="opacity-50 text-sm font-medium tracking-wide">Preferencias personales y seguridad del perfil</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                        <User className="text-brand-secondary" size={20} /> Datos Personales
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1 block">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                <input type="text" defaultValue="Administrador" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1 block">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                <input type="email" defaultValue="admin@acma.gob.hn" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none transition-all opacity-70 cursor-not-allowed" disabled />
                            </div>
                        </div>

                        <button className="w-full py-3 rounded-xl premium-gradient text-white font-bold tracking-wide shadow-lg hover:shadow-brand-secondary/20 transition-all mt-4">
                            Actualizar Perfil
                        </button>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl space-y-6">
                    <h2 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                        <Shield className="text-brand-secondary" size={20} /> Seguridad
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1 block">Contraseña Actual</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1 block">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none transition-all" />
                            </div>
                        </div>

                        <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold tracking-wide transition-all mt-4 border border-white/10 hover:border-white/30">
                            Cambiar Contraseña
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
