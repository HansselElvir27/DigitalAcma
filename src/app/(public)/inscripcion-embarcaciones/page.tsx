'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ship, Anchor, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Port {
    id: string;
    name: string;
  }

  const fallbackPorts: Port[] = [
    { id: 'port_1', name: 'CORTÉS' },
    { id: 'port_2', name: 'ROATÁN' },
    { id: 'port_3', name: 'LA CEIBA' },
    { id: 'port_4', name: 'TELA' },
    { id: 'port_5', name: 'UTILA' },
    { id: 'port_6', name: 'GUANAJA' },
    { id: 'port_7', name: 'TRUJILLO' },
    { id: 'port_8', name: 'BRUS LAGUNA' },
    { id: 'port_9', name: 'OMOA' },
    { id: 'port_10', name: 'AMAPALA' },
    { id: 'port_11', name: 'FERRYS Y CRUCEROS' },
    { id: 'port_12', name: 'PUERTO LEMPIRA' },
    { id: 'port_13', name: 'GUAPINOL' },
    { id: 'port_14', name: 'SAN LORENZO' },
    { id: 'port_15', name: 'JOSE SANTOS GUARDIOLA' },
    { id: 'port_16', name: 'PUERTO CASTILLA' },
  ];

interface FormData {
    fullName: string;
    phone: string;
    email: string;
    portId: string;
}

export default function InscripcionEmbarcaciones() {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phone: '',
        email: '',
        portId: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [ports, setPorts] = useState<Port[]>([]);
    const [portsLoading, setPortsLoading] = useState(true);
    const [trackingId, setTrackingId] = useState('');
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const handleCopy = () => {
        navigator.clipboard.writeText(trackingId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Fetch dynamic ports from API
    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const res = await fetch('/api/public/puertos');
                if (!res.ok) throw new Error('Failed to fetch ports');
                const data = await res.json();
                setPorts(data.length === 0 ? fallbackPorts : data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar las capitanías de puerto. Por favor, recarga la página.');
            } finally {
                setPortsLoading(false);
            }
        };
        fetchPorts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/public/inscripcion-embarcaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Generó un error al enviar.');
            }

            if (data.success && data.request?.id) {
                setTrackingId(data.request.id);
                setSuccess(true);
            } else {
                throw new Error(data.error || 'Respuesta inválida del servidor');
            }
        } catch (err: any) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass-card p-12 rounded-3xl text-center"
                >
                    <div className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-2xl flex items-center justify-center">
                        <Anchor className="w-12 h-12 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-black mb-4 text-green-400">¡Solicitud Enviada!</h1>
                    <p className="text-base opacity-80 mb-6">Tu solicitud de inspección ha sido recibida. La Capitanía de Puerto te asignará una fecha de cita.</p>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                        <p className="text-xs uppercase font-bold opacity-40 tracking-widest mb-2">Tu Código de Seguimiento</p>
                        <p className="font-mono text-sm font-bold text-brand-secondary break-all">{trackingId}</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleCopy}
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-sm transition-colors"
                        >
                            {copied ? '✓ ¡Copiado!' : 'Copiar Código'}
                        </button>
                        <button
                            onClick={() => router.push(`/consultar?id=${trackingId}`)}
                            className="w-full py-3 rounded-xl premium-gradient font-bold text-sm"
                        >
                            Consultar Estado
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto px-4"
            >
                <div className="glass-card p-12 rounded-3xl relative overflow-hidden">
                    {/* Decorator element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="text-center mb-12 relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-brand-secondary to-brand-primary rounded-2xl flex items-center justify-center shadow-xl"
                        >
                            <Ship className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase italic text-white mb-4">
                            Inscripción de <br />
                            <span className="text-brand-secondary text-4xl">Embarcaciones Menores</span>
                        </h1>
                        <p className="opacity-70 text-lg max-w-lg mx-auto leading-relaxed">
                            Completa el formulario y tu Capitanía de Puerto te asignará una cita para inspección.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Full Name */}
                        <div className="relative group">
                            <label className="block text-sm font-bold mb-2 opacity-80 pl-1 uppercase tracking-wider">Nombre Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Anchor className="text-brand-secondary h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-field w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-brand-secondary transition-all"
                                    placeholder="Nombre completo del propietario"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Capitanía de Puerto */}
                        <div className="relative group">
                            <label className="block text-sm font-bold mb-2 opacity-80 pl-1 uppercase tracking-wider">Capitanía de Puerto</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <MapPin className="text-brand-secondary h-5 w-5" />
                                </div>
                                <select
                                    required
                                    disabled={portsLoading}
                                    className="input-field w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-brand-secondary transition-all appearance-none text-white [&>option]:text-black disabled:opacity-50 disabled:cursor-wait"
                                    value={formData.portId}
                                    onChange={(e) => setFormData({ ...formData, portId: e.target.value })}
                                >
                                    <option value="" disabled>
                                        {portsLoading ? 'Cargando puertos...' : 'Selecciona el puerto de jurisdicción'}
                                    </option>
                                    {ports.map((port: Port) => (
                                        <option key={port.id} value={port.id}>
                                            {port.name}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom dropdown arrow to replace the native hidden one */}
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div className="relative group">
                            <label className="block text-sm font-bold mb-2 opacity-80 pl-1 uppercase tracking-wider">Teléfono de Contacto</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Phone className="text-brand-secondary h-5 w-5" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    className="input-field w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-brand-secondary transition-all"
                                    placeholder="+504 9999-9999"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <label className="block text-sm font-bold mb-2 opacity-80 pl-1 uppercase tracking-wider">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="text-brand-secondary h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-field w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-brand-secondary transition-all"
                                    placeholder="ejemplo@correo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                                {error}
                            </motion.div>
                        )}

                        <div className="pt-6">
                            <motion.button
                                type="submit"
                                disabled={loading || portsLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full premium-gradient text-white font-bold py-5 px-8 rounded-xl text-lg shadow-[0_0_30px_rgba(255,102,0,0.3)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(255,102,0,0.5)] transition-all"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={20} />
                                        Solicitar Inscripción e Inspección
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
