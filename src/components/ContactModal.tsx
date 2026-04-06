"use client"

import { MessageCircle, MapPin, X } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-brand-secondary to-brand-primary bg-clip-text text-transparent">
          CONTACTO Y ASISTENCIA
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-start text-white">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* WhatsApp Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-green-500/20 p-6 rounded-2xl border border-green-400/30 font-sans">
              <a 
                href="https://wa.me/50488208428?text=Hola%20desde%20Plataforma%20Digital%20ACMA"
                className="group flex items-center gap-3 p-4 premium-gradient text-white rounded-xl shadow-2xl hover:scale-105 transition-all font-bold"
              >
                <MessageCircle size={24} className="group-hover:animate-bounce" />
                WhatsApp Asistencia
                <span className="text-sm">+504 8820-8428</span>
              </a>
            </div>

            {/* Phone Number */}
            <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-400/30">
              <p className="text-lg font-bold mb-2">Teléfono:</p>
              <a href="tel:+50422398363" className="text-xl font-bold hover:text-brand-secondary transition-colors">
                +504 2239-8363
              </a>
            </div>

            {/* Dirección */}
            <div className="space-y-3">
              <p className="text-lg font-bold text-neutral-200">Dirección/Address</p>
              <p className="text-base leading-relaxed bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                Boulevard Suyapa, Edificio Pietra, Contiguo a ALUPAC, 
                Apdo. Postal 3625, Tegucigalpa, M.D.C., Honduras, C.A
              </p>
              <a 
                href="https://www.openstreetmap.org/#map=19/14.083570/-87.177586" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-secondary hover:underline text-sm"
              >
                <MapPin size={16} /> Ver en OpenStreetMap
              </a>
            </div>
          </div>

          {/* Google Maps */}
          <div className="space-y-4">
            <label className="font-bold text-lg">Ubicación</label>
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <iframe 
                src="https://www.google.com/maps/d/embed?mid=1rNBPyeJhLmRGXb6YcXepe3rDaFE&ehbc=2E312F" 
                width="100%" 
                height="100%"
                allowFullScreen={true}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
