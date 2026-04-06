"use client"

import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { ContactModal } from "./ContactModal";

export function Navbar() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <nav className="glass-card sticky top-0 z-50 px-8 py-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full premium-gradient"></div>
          <span className="font-bold tracking-tight text-xl">DIGITAL ACMA</span>
        </div>
        <div className="flex gap-6 items-center">
          <a href="/" className="hover:text-brand-secondary transition-colors">Inicio</a>
          <a href="/servicios" className="hover:text-brand-secondary transition-colors">Servicios</a>
          <a href="/consultar" className="flex items-center gap-2 hover:text-brand-secondary transition-colors font-medium">
            <Search size={16} /> Consultar Solicitud
          </a>
          <button 
            onClick={() => setIsContactOpen(true)}
            className="flex items-center gap-2 hover:text-brand-secondary transition-colors font-medium cursor-pointer"
          >
            <MessageSquare size={16} /> Contacto y Asistencia
          </button>
          <a href="/inscripcion-embarcaciones" className="hover:text-brand-secondary transition-colors font-medium flex items-center gap-1">
            Nueva Inscripción Embarcación
          </a>
          <a href="/auth/signin" className="premium-gradient px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg hover:opacity-90 transition-all">
            Acceso Institucional
          </a>
        </div>
      </nav>

      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </>
  );
}
