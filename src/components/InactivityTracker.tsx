"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { AlertCircle, LogOut } from "lucide-react";

// 10 minutos de inactividad (en milisegundos)
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
// Aviso preventivo cuando falte 1 minuto (60 segundos)
const WARNING_BEFORE_TIMEOUT_MS = 60 * 1000;

export function InactivityTracker() {
    const { data: session, status } = useSession();
    const [showWarning, setShowWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(60);

    const lastActivityRef = useRef<number>(Date.now());
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const performLogout = useCallback(async () => {
        setShowWarning(false);
        try {
            await signOut({
                redirect: true,
                callbackUrl: "/auth/signin?error=SessionExpired",
            });
        } catch {
            window.location.href = "/auth/signin?error=SessionExpired";
        }
    }, []);

    const resetInactivityTimers = useCallback(() => {
        lastActivityRef.current = Date.now();

        if (showWarning) {
            setShowWarning(false);
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }

        // Timer para la advertencia (al minuto 9 de inactividad)
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsLeft(Math.floor(WARNING_BEFORE_TIMEOUT_MS / 1000));

            countdownIntervalRef.current = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS);

        // Timer final para cerrar sesión (a los 10 minutos exactos de inactividad)
        logoutTimerRef.current = setTimeout(() => {
            performLogout();
        }, INACTIVITY_TIMEOUT_MS);
    }, [showWarning, performLogout]);

    useEffect(() => {
        // Solo rastrear si hay un usuario autenticado
        if (status !== "authenticated" || !session?.user) {
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return;
        }

        const activityEvents = [
            "mousemove",
            "mousedown",
            "keydown",
            "touchstart",
            "scroll",
            "click",
        ];

        // Handler con throttle para no saturar con mousemove
        let throttleTimer: NodeJS.Timeout | null = null;
        const handleActivity = () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
            }, 1000); // Máximo 1 actualización por segundo
            resetInactivityTimers();
        };

        // Iniciar timers
        resetInactivityTimers();

        // Escuchar eventos de interacción del usuario
        activityEvents.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            activityEvents.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            if (throttleTimer) clearTimeout(throttleTimer);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [status, session, resetInactivityTimers]);

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-card bg-[#0f172a] border-2 border-amber-500/50 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40 animate-pulse">
                    <AlertCircle size={36} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                        Cierre de Sesión por Inactividad
                    </h3>
                    <p className="text-sm opacity-70 text-slate-300">
                        No se ha detectado actividad en los últimos 9 minutos. Por razones de seguridad institucional, su sesión finalizará en:
                    </p>
                </div>

                <div className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                    {secondsLeft}s
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={performLogout}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LogOut size={16} /> Salir ahora
                    </button>
                    <button
                        onClick={resetInactivityTimers}
                        className="flex-1 premium-gradient text-white py-3 rounded-xl text-xs font-bold shadow-lg hover:opacity-95 transition-all cursor-pointer"
                    >
                        Mantener Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
