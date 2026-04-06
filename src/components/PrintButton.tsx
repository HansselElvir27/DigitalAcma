"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <div className="fixed bottom-8 right-8 print:hidden">
            <button
                onClick={() => window.print()}
                className="bg-brand-primary text-brand-secondary font-black tracking-widest px-8 py-4 rounded-full shadow-2xl border-2 border-brand-secondary hover:scale-105 transition-all uppercase text-sm flex items-center gap-3"
            >
                <Printer size={20} /> Imprimir Documento
            </button>
        </div>
    );
}
