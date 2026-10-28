"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    AlertCircle, 
    CheckCircle2, 
    XCircle, 
    HelpCircle, 
    X 
} from "lucide-react";

export type ModalType = "CONFIRM" | "SUCCESS" | "ERROR" | "INFO";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type: ModalType;
    confirmText?: string;
    cancelText?: string;
}

export function NotificationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type,
    confirmText = "Confirmar",
    cancelText = "Cancelar"
}: NotificationModalProps) {
    
    const iconMap = {
        CONFIRM: <HelpCircle className="text-amber-400" size={40} />,
        SUCCESS: <CheckCircle2 className="text-emerald-400" size={40} />,
        ERROR: <XCircle className="text-rose-400" size={40} />,
        INFO: <AlertCircle className="text-indigo-400" size={40} />
    };

    const gradientMap = {
        CONFIRM: "from-amber-500/20 to-transparent",
        SUCCESS: "from-emerald-500/20 to-transparent",
        ERROR: "from-rose-500/20 to-transparent",
        INFO: "from-indigo-500/20 to-transparent"
    };

    const buttonClassMap = {
        CONFIRM: "bg-amber-500 hover:bg-amber-600 text-black",
        SUCCESS: "bg-emerald-500 hover:bg-emerald-600 text-white",
        ERROR: "bg-rose-500 hover:bg-rose-600 text-white",
        INFO: "bg-indigo-500 hover:bg-indigo-600 text-white"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] pointer-events-none"
                    >
                        <div className="pointer-events-auto relative overflow-hidden glass-card rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-slate-900/90 perspective-1000">
                            {/* Accent Glow */}
                            <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${gradientMap[type]} opacity-50`} />

                            <div className="relative p-10 flex flex-col items-center text-center">
                                {/* Close Button */}
                                <button 
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors opacity-30 hover:opacity-100"
                                >
                                    <X size={20} />
                                </button>

                                {/* Icon Circle */}
                                <div className="mb-6 relative">
                                    <div className="absolute inset-0 blur-2xl opacity-20 bg-current" />
                                    <div className="relative w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                        {iconMap[type]}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black uppercase italic tracking-tight mb-3">
                                    {title}
                                </h3>
                                <p className="text-sm opacity-60 leading-relaxed font-medium mb-10">
                                    {message}
                                </p>

                                <div className="flex gap-4 w-full">
                                    {onConfirm && (
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            {cancelText}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (onConfirm) onConfirm();
                                            else onClose();
                                        }}
                                        className={`flex-1 px-6 py-4 rounded-2xl ${buttonClassMap[type]} text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
