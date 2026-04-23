"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Ship, Users, Settings, LogOut, Bell, Search, LifeBuoy, Anchor, AlertTriangle, Satellite, ClipboardList } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const user = session?.user;
    const isCIM = user?.role === "CIM";
    const isAdmin = user?.role === "ADMIN";
    const canManageUsers = isAdmin;
    const canViewInfo = isCIM || isAdmin;
    const pathname = usePathname();

    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    const dashboardHref = isAdmin || isCIM ? "/dashboard/cim" : "/dashboard/capitan";

    return (
        <div className="flex min-h-screen bg-background -mt-12 -mx-4">
            {/* Sidebar */}
            <aside className="w-72 glass-card border-r border-white/5 flex flex-col p-6 gap-8 sticky top-0 h-screen">
                <div className="flex items-center gap-3 px-2">
                    <img src="/dgmm-seal-official.png" alt="DGMM ACMA Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">{isAdmin ? "Admin Panel" : isCIM ? "CIM Panel" : "Capitanía"}</h2>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{user?.role || "USUARIO"}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: dashboardHref, active: pathname === dashboardHref },
                        ...(canViewInfo ? [{ icon: <FileText size={20} />, label: "Solicitudes de Info", href: "/dashboard/info", active: pathname === "/dashboard/info" }] : []),
                        { icon: <ClipboardList size={20} />, label: "Inspección Embarcaciones", href: "/dashboard/inscripcion-embarcaciones", active: pathname === "/dashboard/inscripcion-embarcaciones" },
                        { icon: <Anchor size={20} />, label: "Buques Registrados", href: "/dashboard/vessels", active: pathname === "/dashboard/vessels" },
                        { icon: <Ship size={20} />, label: "Zarpes Pendientes", href: "/dashboard/zarpes", active: pathname === "/dashboard/zarpes" },
                        { icon: <LifeBuoy size={20} />, label: "Pases de Salida", href: "/dashboard/pase-salida", active: pathname === "/dashboard/pase-salida" },
                        { icon: <Anchor size={20} />, label: "Avisos de Arribo", href: "/dashboard/arribos", active: pathname === "/dashboard/arribos" },
                        { icon: <AlertTriangle size={20} />, label: "Reportes Marítimos", href: "/dashboard/reporte-maritimo", active: pathname === "/dashboard/reporte-maritimo", danger: true },
                        { icon: <Satellite size={20} />, label: "Desactivación Baliza", href: "/dashboard/desactivacion-baliza", active: pathname === "/dashboard/desactivacion-baliza" },
                        ...(canManageUsers ? [{ icon: <Users size={20} />, label: "Usuarios / Puertos", href: "/dashboard/usuarios", active: pathname === "/dashboard/usuarios" }] : []),
                        { icon: <Settings size={20} />, label: "Configuración", href: "/dashboard/settings", active: pathname === "/dashboard/settings" },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? (item.danger ? 'bg-red-600 text-white shadow-lg' : 'premium-gradient text-white shadow-lg') : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                            {item.icon}
                            <span className="font-semibold text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={() => signOut({ redirect: true, callbackUrl: "/auth/signin" })}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all opacity-70 hover:opacity-100"
                >
                    <LogOut size={20} />
                    <span className="font-bold text-sm">Cerrar Sesión</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 glass-card sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                            <input type="text" placeholder="Buscar expedientes, buques o trámites..." className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold">{user?.name || "Cargando..."}</p>
                                <p className="text-[10px] opacity-40 font-bold uppercase">{user?.role || "..."}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-brand-secondary/20 border border-brand-secondary/30 flex items-center justify-center font-bold text-brand-secondary">
                                {initials}
                            </div>
                        </div>

                        {/* Top Logout Button */}
                        <button 
                            onClick={() => signOut({ redirect: true, callbackUrl: "/auth/signin" })}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </header>

                <section className="p-10">
                    {children}
                </section>
            </main>
        </div>
    );
}
