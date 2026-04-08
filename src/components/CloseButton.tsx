"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function CloseButton() {
    const router = useRouter();

    const handleClose = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            window.close();
            // Fallback if window.close() is blocked
            router.push('/');
        }
    };

    return (
        <button 
            onClick={handleClose}
            className="fixed top-6 left-6 z-50 print:hidden bg-brand-secondary text-white px-4 py-2 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm tracking-wide"
        >
            <ArrowLeft size={18} />
            Regresar
        </button>
    );
}
