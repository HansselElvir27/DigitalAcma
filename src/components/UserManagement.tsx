"use client";

import { useState } from "react";
import { Users, Shield, MapPin, Eye, X, Check, Save, Trash2, Mail, Lock, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function UserManagement({ initialUsers, ports, currentUserRole }: { initialUsers: any[], ports: any[], currentUserRole: string }) {
    const [users, setUsers] = useState(initialUsers);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "CAPITAN",
        portId: ""
    });

    const isAdmin = currentUserRole === "ADMIN";

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al crear usuario");
            }

            const data = await res.json();
            setUsers([data.user, ...users]);
            setShowModal(false);
            setFormData({ name: "", email: "", password: "", role: "CAPITAN", portId: "" });
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar este usuario?")) return;
        
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Error al eliminar");

            setUsers(users.filter(u => u.id !== id));
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Users Table */}
                <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <h2 className="font-bold text-lg flex items-center gap-2">Usuarios del Sistema</h2>
                            <div className="relative max-w-xs w-full">
                                <input 
                                    type="text" 
                                    placeholder="Buscar..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-brand-secondary outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                            </div>
                        </div>
                        {isAdmin && (
                            <button 
                                onClick={() => setShowModal(true)}
                                className="text-xs font-bold text-white bg-brand-secondary px-6 py-2 rounded-full hover:brightness-110 transition-all shadow-lg"
                            >
                                + Nuevo Usuario
                            </button>
                        )}
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
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center opacity-40 text-sm">No se encontraron usuarios</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm tracking-tight">{user.name || "Sin Nombre"}</p>
                                                <p className="text-[10px] opacity-40 font-mono tracking-tighter">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${user.role === 'CIM' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                        user.role === 'CAPITAN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                            'bg-white/5 text-white/70 border-white/10'
                                                    }`}>
                                                    <Shield size={12} />
                                                    {user.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-sm opacity-80 flex items-center gap-1.5">
                                                    <MapPin size={14} className="opacity-40" />
                                                    {user.port?.name || user.portId || "N/A"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs opacity-60">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-secondary transition-colors opacity-0 group-hover:opacity-100">
                                                        <Eye size={16} />
                                                    </button>
                                                    {isAdmin && user.role !== 'ADMIN' && (
                                                        <button 
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) }
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
                                    <p className="text-xs opacity-50 mt-1 flex items-center gap-1 font-mono">
                                        ID: {port.id}
                                    </p>
                                </div>
                            ))
                        )}
                        {isAdmin && (
                            <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-white/20 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white hover:border-white/50 transition-colors">
                                + Agregar Puerto
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Nuevo Usuario */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-brand-primary w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between premium-gradient">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                    <Users size={20} /> Crear Nuevo Usuario
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Nombre Completo</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none"
                                            placeholder="Juan Pérez"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                        <input 
                                            required
                                            type="email" 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none"
                                            placeholder="usuario@acma.gov"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                        <input 
                                            required
                                            type="password" 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Rol</label>
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        >
                                            <option value="CAPITAN" className="bg-brand-primary">CAPITÁN</option>
                                            <option value="CIM" className="bg-brand-primary">CIM</option>
                                            <option value="ADMIN" className="bg-brand-primary">ADMIN</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Puerto</label>
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-secondary outline-none"
                                            value={formData.portId}
                                            onChange={(e) => setFormData({...formData, portId: e.target.value})}
                                        >
                                            <option value="" className="bg-brand-primary">Sin puerto</option>
                                            {ports.map(p => (
                                                <option key={p.id} value={p.id} className="bg-brand-primary">{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    disabled={loading}
                                    type="submit"
                                    className="w-full premium-gradient py-4 rounded-xl text-white font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} /> Guardar Usuario</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
