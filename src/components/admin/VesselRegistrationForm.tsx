import { useState, useRef } from "react";
import { Ship, Anchor, User, MapPin, Calendar, ClipboardList, PenTool, CheckCircle, X, Plus, Trash2, Search, Loader2, Upload, Paperclip, ExternalLink, Image as ImageIcon } from "lucide-react";
import { VESSEL_TYPES, ACTIVITY_TYPES } from "@/lib/vessel-codes";

interface Props {
  requestId?: string;
  portId: string;
  citaNumber?: string;
  onSuccess: (registration: any) => void;
  onCancel: () => void;
  initialData?: any;
  isRenewal?: boolean;
}

export default function VesselRegistrationForm({ requestId, portId, citaNumber, onSuccess, onCancel, initialData, isRenewal }: Props) {
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  const paymentInputRef = useRef<HTMLInputElement>(null);
  const vesselPhotosInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    vesselName: initialData?.vesselName || "",
    eslora: initialData?.eslora || "",
    manga: initialData?.manga || "",
    punta: initialData?.punta || "",
    calado: initialData?.calado || "",
    passengerCapacity: initialData?.passengerCapacity || "",
    crewCapacity: initialData?.crewCapacity || "",
    engineBrand: initialData?.engineBrand || "",
    ownerId: initialData?.ownerId || "",
    ownerName: initialData?.ownerName || "",
    vesselType: initialData?.vesselType || VESSEL_TYPES[0],
    activityType: initialData?.activityType || ACTIVITY_TYPES[0],
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    email: initialData?.email || "",
    rtn: initialData?.rtn || "",
    yearBuilt: initialData?.yearBuilt || "",
    grossTonnage: initialData?.grossTonnage || "",
    netTonnage: initialData?.netTonnage || "",
    color: initialData?.color || "",
    hullMaterial: initialData?.hullMaterial || "",
    route: initialData?.route || "",
    observations: initialData?.observations || "",
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: "",
  });

  const [engineSerials, setEngineSerials] = useState<string[]>(initialData?.engineSerials || [""]);
  const [vesselPhotos, setVesselPhotos] = useState<string[]>(initialData?.vesselPhotos || []);
  const [documents, setDocuments] = useState<string[]>(initialData?.documents || []);
  const [paymentPhoto, setPaymentPhoto] = useState<string>(initialData?.paymentPhoto || "");

  const checkVesselName = async () => {
    if (!formData.vesselName.trim()) return;
    setCheckingName(true);
    try {
      const res = await fetch(`/api/vessels/check-name?name=${encodeURIComponent(formData.vesselName)}`);
      const data = await res.json();
      setNameAvailable(!data.exists);
    } catch (error) {
      console.error("Error checking name", error);
    } finally {
      setCheckingName(false);
    }
  };

  const handleAddEngine = () => setEngineSerials([...engineSerials, ""]);
  const handleRemoveEngine = (index: number) => {
    const newSerials = [...engineSerials];
    newSerials.splice(index, 1);
    setEngineSerials(newSerials);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'payment' | 'vessel' | 'doc') => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (type === 'payment') {
          setPaymentPhoto(dataUrl);
        } else if (type === 'vessel') {
          setVesselPhotos(prev => [...prev, dataUrl]);
        } else {
          setDocuments(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input to allow re-uploading same file
    e.target.value = "";
  };

  const removeFile = (type: 'vessel' | 'doc', index: number) => {
    if (type === 'vessel') {
      setVesselPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        engineSerials: engineSerials.filter(s => s.trim() !== ""),
        vesselPhotos,
        documents,
        paymentPhoto,
        requestId,
        portId,
        citaNumber
      };

      const res = await fetch("/api/vessels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.registration);
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar registro");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b border-white/10 premium-gradient flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Ship size={24} className="text-brand-secondary" /> {isRenewal ? "Renovación de Registro" : "Registro de Embarcación"}
          </h2>
          <p className="text-xs opacity-60">{isRenewal ? "Actualice los datos técnicos para renovar el permiso" : "Complete los datos técnicos para generar el permiso de navegación"}</p>
        </div>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        {/* Identificación Básica */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-brand-secondary/20 pb-2">Identificación de Embarcación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Nombre de la Embarcación</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.vesselName}
                  onChange={e => { setFormData({...formData, vesselName: e.target.value}); setNameAvailable(null); }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={checkVesselName}
                  disabled={checkingName || !formData.vesselName.trim()}
                  className={`px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    nameAvailable === true ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    nameAvailable === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-brand-secondary text-white'
                  }`}
                >
                  {checkingName ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {nameAvailable === true ? "Disponible" : nameAvailable === false ? "Ya Existe" : "Verificar"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Tipo</label>
                <select
                  value={formData.vesselType}
                  onChange={e => setFormData({...formData, vesselType: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none appearance-none"
                >
                  {VESSEL_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Actividad</label>
                <select
                  value={formData.activityType}
                  onChange={e => setFormData({...formData, activityType: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none appearance-none"
                >
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Dimensiones y Capacidades */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-brand-secondary/20 pb-2">Especificaciones Técnicas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'eslora', label: 'Eslora' },
              { id: 'manga', label: 'Manga' },
              { id: 'punta', label: 'Punta' },
              { id: 'calado', label: 'Calado' },
              { id: 'passengerCapacity', label: 'Cap. Pasajeros' },
              { id: 'crewCapacity', label: 'Cap. Tripulantes' },
              { id: 'yearBuilt', label: 'Año de Const.' },
              { id: 'hullMaterial', label: 'Material Casco' },
              { id: 'grossTonnage', label: 'TBR (Bruto)' },
              { id: 'netTonnage', label: 'TNR (Neto)' },
              { id: 'color', label: 'Color' },
              { id: 'route', label: 'Ruta' },
            ].map(field => (
              <div key={field.id} className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">{field.label}</label>
                <input
                  type="text"
                  value={(formData as any)[field.id]}
                  onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Motores */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-brand-secondary/20 pb-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary">Motores</h3>
            <button
              type="button"
              onClick={handleAddEngine}
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-brand-secondary hover:text-white transition-colors"
            >
              <Plus size={14} /> Añadir Motor
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Marca de Motor</label>
              <input
                type="text"
                value={formData.engineBrand}
                onChange={e => setFormData({...formData, engineBrand: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1 block">Series de Motores</label>
              {engineSerials.map((serial, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={serial}
                    onChange={e => {
                      const newSerials = [...engineSerials];
                      newSerials[idx] = e.target.value;
                      setEngineSerials(newSerials);
                    }}
                    placeholder={`Serie Motor ${idx + 1}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-brand-secondary outline-none"
                  />
                  {engineSerials.length > 1 && (
                    <button type="button" onClick={() => handleRemoveEngine(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Propietario */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-brand-secondary/20 pb-2">Información del Propietario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'ownerId', label: 'Identidad Propietario', required: true },
              { id: 'ownerName', label: 'Nombre Propietario', required: true },
              { id: 'rtn', label: 'RTN' },
              { id: 'phone', label: 'Teléfono' },
              { id: 'email', label: 'Correo Electrónico' },
              { id: 'address', label: 'Dirección' },
            ].map(field => (
              <div key={field.id} className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">{field.label}</label>
                <input
                  type="text"
                  required={field.required}
                  value={(formData as any)[field.id]}
                  onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Fechas y Observaciones */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-brand-secondary/20 pb-2">Emisión y Vigencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Fecha de Emisión</label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={e => setFormData({...formData, issueDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Fecha de Expiración</label>
              <input
                type="date"
                required
                value={formData.expirationDate}
                onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Nº Cita Vinculada</label>
              <input
                type="text"
                readOnly
                value={citaNumber || ""}
                className="w-full bg-white/5 border border-white/5 opacity-50 rounded-xl px-4 py-3 text-sm italic"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest px-1">Observaciones</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-secondary outline-none resize-none"
            />
          </div>
        </section>

        {/* Adjuntos */}
        <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-secondary border-b border-brand-secondary/20 pb-2">Documentación Adjunta</h3>
            
            {/* Hidden Inputs */}
            <input type="file" className="hidden" ref={paymentInputRef} onChange={e => handleFileChange(e, 'payment')} accept="image/*,.pdf" />
            <input type="file" className="hidden" ref={vesselPhotosInputRef} onChange={e => handleFileChange(e, 'vessel')} multiple accept="image/*" />
            <input type="file" className="hidden" ref={documentsInputRef} onChange={e => handleFileChange(e, 'doc')} multiple accept="image/*,.pdf,.doc,.docx" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recibo de Pago */}
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
                      <PenTool size={20} className="mx-auto opacity-30" />
                      <p className="text-[10px] font-bold uppercase opacity-50">Recibo de Pago</p>
                      <button 
                        type="button" 
                        onClick={() => paymentInputRef.current?.click()}
                        className="text-[10px] font-black text-brand-secondary hover:underline flex items-center gap-1 mx-auto"
                      >
                        <Upload size={12} /> {paymentPhoto ? "Cambiar Archivo" : "Subir Archivo"}
                      </button>
                  </div>
                  {paymentPhoto && (
                    <div className="p-3 bg-brand-secondary/10 border border-brand-secondary/20 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <ImageIcon size={14} className="text-brand-secondary shrink-0" />
                        <span className="text-[10px] font-bold truncate">RECIBO_PAGO.jpg</span>
                      </div>
                      <a 
                        href={paymentPhoto.startsWith('/uploads/') ? `/api${paymentPhoto}` : paymentPhoto} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-brand-secondary hover:text-white"
                      >
                         <ExternalLink size={14} />
                      </a>
                      <button type="button" onClick={() => setPaymentPhoto("")} className="text-red-400 hover:text-red-300 ml-2">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Fotos Embarcación */}
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
                      <ImageIcon size={20} className="mx-auto opacity-30" />
                      <p className="text-[10px] font-bold uppercase opacity-50">Fotos Embarcación</p>
                      <button 
                        type="button" 
                        onClick={() => vesselPhotosInputRef.current?.click()}
                        className="text-[10px] font-black text-brand-secondary hover:underline flex items-center gap-1 mx-auto"
                      >
                        <Upload size={12} /> Añadir Fotos
                      </button>
                  </div>
                  {vesselPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {vesselPhotos.map((photo, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                          <img src={photo?.startsWith('/uploads/') ? `/api${photo}` : photo} className="w-full h-full object-cover" alt="" />
                          <button 
                            type="button" 
                            onClick={() => removeFile('vessel', i)}
                            className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documentos Interés */}
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
                      <ClipboardList size={20} className="mx-auto opacity-30" />
                      <p className="text-[10px] font-bold uppercase opacity-50">Documentos Interés</p>
                      <button 
                        type="button" 
                        onClick={() => documentsInputRef.current?.click()}
                        className="text-[10px] font-black text-brand-secondary hover:underline flex items-center gap-1 mx-auto"
                      >
                        <Upload size={12} /> Añadir Documentos
                      </button>
                  </div>
                  <div className="space-y-2">
                    {documents.map((doc, i) => (
                      <div key={i} className="p-2 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                        <a 
                          href={doc?.startsWith('/uploads/') ? `/api${doc}` : doc} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 overflow-hidden hover:text-brand-secondary transition-colors"
                        >
                          <Paperclip size={12} className="opacity-40 shrink-0" />
                          <span className="text-[10px] truncate max-w-[100px]">Doc_{i+1}</span>
                        </a>
                        <button type="button" onClick={() => removeFile('doc', i)} className="text-red-400 hover:text-red-300">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || nameAvailable === false}
          className="px-10 py-3 rounded-xl bg-brand-secondary text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-brand-secondary/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {loading ? "Procesando..." : "Guardar Registro"}
        </button>
      </div>
    </form>
  );
}
