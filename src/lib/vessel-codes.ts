// Port codes and activity codes for vessel registration correlative number generation

export const PORT_CODES: Record<string, { code: string; prefix: string }> = {
  "Tegucigalpa": { code: "01", prefix: "TGU" },
  "Roatan":      { code: "02", prefix: "RO" },
  "Utila":       { code: "03", prefix: "UT" },
  "Guanaja":     { code: "04", prefix: "GU" },
  "Ceiba":       { code: "05", prefix: "LC" },
  "Castilla":    { code: "06", prefix: "CT" },
  "Cortes":      { code: "07", prefix: "PC" },
  "Puerto Cortés": { code: "07", prefix: "PC" },
  "Omoa":        { code: "08", prefix: "OM" },
  "Tela":        { code: "09", prefix: "TE" },
  "Lempira":     { code: "10", prefix: "PL" },
  "Bruslaguna":  { code: "11", prefix: "PB" },
  "Amapla":      { code: "12", prefix: "AM" },
  "San Lorenzo": { code: "13", prefix: "SL" },
  "Guapinol":    { code: "14", prefix: "GPN" },
  "Lago de Yojoa": { code: "15", prefix: "LY" },
  "Jose Santos Guardiola": { code: "16", prefix: "JSG" },
};

export const ACTIVITY_CODES: Record<string, number> = {
  "Transporte de Pasajeros (Cabotaje)":       1,
  "Transporte de Pasajeros (Internacional)":  2,
  "Transporte de Carga (Cabotaje)":           3,
  "Transporte de Carga (Internacional)":      4,
  "Pesca Comercial":                          5,
  "Pesca Artesanal":                          6,
  "Recreativas (Jetsky, Velero)":             7,
  "Submarinos Recreativos":                   8,
  "Buceo Deportivo":                          9,
  "Pesca Deportiva":                         10,
};

export const VESSEL_TYPES = [
  "Velero", "Exploración", "Yate", "Catamarán", "Lancha", "Bote", "Balsa", "Otro"
];

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_CODES);

/**
 * Build the registration correlative number.
 * Format: PREFIX-CODE-NNNN-ACTIVITY_CODE
 * Example: RO-02-0001-6
 */
export function buildRegistrationNumber(
  portName: string,
  sequentialCount: number,
  activityType: string
): string {
  // Try exact match first, then partial match
  let portEntry = PORT_CODES[portName];
  if (!portEntry) {
    const key = Object.keys(PORT_CODES).find(
      k => portName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(portName.toLowerCase())
    );
    portEntry = key ? PORT_CODES[key] : { code: "00", prefix: "XX" };
  }

  const activityCode = ACTIVITY_CODES[activityType] ?? 0;
  const sequential = String(sequentialCount).padStart(4, "0");
  return `${portEntry.prefix}-${portEntry.code}-${sequential}-${activityCode}`;
}
