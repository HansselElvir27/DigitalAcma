"use client";

import { motion } from "framer-motion";
import { Lock, Mail, Key } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error");
    // callbackUrl after login (the dashboard page will route to the correct role page)
    const callbackUrl = "/dashboard";

    const displayError = error || (urlError ? "Credenciales inválidas o sesión expirada." : "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Obtener el token CSRF de NextAuth
            const csrfResponse = await fetch("/api/auth/csrf");
            if (!csrfResponse.ok) {
                throw new Error("No se pudo obtener el token CSRF");
            }
            const { csrfToken } = await csrfResponse.json();

            // 2. Enviar como form POST nativo para que el browser maneje
            //    el Set-Cookie del redirect 302 de forma nativa (más confiable que fetch)
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/api/auth/callback/credentials";

            const fields: Record<string, string> = {
                csrfToken: csrfToken || "",
                email: email.trim().toLowerCase(),
                password,
                callbackUrl,
            };

            Object.entries(fields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit(); // El browser maneja el cookie del redirect 302 nativamente
        } catch (err: any) {
            console.error("[LOGIN] Exception:", err);
            setError("Error de conexión con el servidor. Intente de nuevo.");
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card p-10 rounded-3xl space-y-8 border-t-4 border-t-brand-secondary"
        >
            <div className="text-center space-y-2">
                <img src="/dgmm-seal-official.png" alt="DGMM ACMA Logo" className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-xl" />
                <h1 className="text-3xl font-bold">Bienvenido</h1>
                <p className="opacity-60">Acceso exclusivo para personal institucional</p>
            </div>

            {displayError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm text-center font-medium">
                    {displayError}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 px-1">
                        <Mail size={14} className="text-brand-secondary" /> Correo Institucional
                    </label>
                    <input
                        type="email"
                        placeholder="usuario@acma.gov"
                        className="input-field"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 px-1">
                        <Key size={14} className="text-brand-secondary" /> Contraseña
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="input-field"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full premium-gradient py-4 rounded-xl text-white font-bold text-lg shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Accediendo...</span>
                        </div>
                    ) : (
                        <><Lock size={20} /> Entrar</>
                    )}
                </button>
            </form>

            <div className="text-center">
                <p className="text-xs opacity-40">Digital ACMA © 2026. Todos los accesos son monitoreados.</p>
            </div>
        </motion.div>
    );
}

export default function SignIn() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <Suspense fallback={<div className="text-white opacity-50">Cargando...</div>}>
                <SignInForm />
            </Suspense>
        </div>
    );
}
