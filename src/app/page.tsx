import { Search, Ship, FileText, Bell, ShieldCheck, Anchor } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="text-center py-20 space-y-6">
        <img src="/dgmm-seal-official.png" alt="DGMM ACMA Logo" className="w-32 h-32 md:w-40 md:h-40 mx-auto object-contain drop-shadow-2xl" />
        <h1 className="text-6xl font-extrabold tracking-tighter sm:text-7xl">
          Gestión Marítima <span className="text-brand-secondary">Inteligente</span>
        </h1>
        <p className="text-xl opacity-70 max-w-2xl mx-auto">
          Simplificamos los trámites marítimos para ciudadanos e instituciones, garantizando seguridad y eficiencia en cada despacho / DGMM.
        </p>
        <div className="flex justify-center gap-4 pt-8">
          <a href="/solicitud-informacion" className="premium-gradient px-8 py-4 rounded-xl text-white font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-2">
            <FileText size={20} /> Iniciar Trámite
          </a>
          <a href="/consultar" className="glass-card px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/5 shadow-xl">
            <Search size={20} /> Rastrear Solicitud
          </a>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: <Search />, title: "Solicitud de Información", desc: "Intercambio ágil de datos marítimos.", href: "/solicitud-informacion" },
          { icon: <Ship />, title: "Zarpes Nacionales", desc: "Autorización de salida para embarcaciones.", href: "/zarpes-nacionales" },
          { icon: <ShieldCheck />, title: "Pase de Salida", desc: "Embarcaciones náuticas deportivas.", href: "/pase-salida" },
          { icon: <Bell />, title: "Aviso de Arribo", desc: "Notificación oficial de ingreso a puerto.", href: "/aviso-arribo" },
          { icon: <FileText />, title: "Reporte Marítimo", desc: "Envío de informes institucionales.", href: "/reporte-maritimo" },
          { icon: <ShieldCheck />, title: "Baliza Satelital", desc: "Desactivación de dispositivos segura.", href: "/desactivacion-baliza" },
          { icon: <Anchor />, title: "Inscripción Embarcaciones Menores", desc: "Registro oficial para embarcaciones menores.", href: "/inscripcion-embarcaciones" }
        ].map((service, i) => (
          <a key={i} href={service.href} className="glass-card p-8 rounded-2xl hover:translate-y-[-8px] transition-all group border-b-4 border-b-transparent hover:border-b-brand-secondary">
            <div className="w-12 h-12 rounded-lg premium-gradient flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              {service.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
            <p className="opacity-60 text-sm">{service.desc}</p>
          </a>
        ))}
      </section>
    </div>
  );
}

