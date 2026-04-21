import { prisma } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

const ACTIVITY_MAP: Record<string, string> = {
  "1": "Transporte de Pasajeros (Cabotaje)",
  "2": "Transporte de Pasajeros (Internacional)",
  "3": "Transporte de Carga (Cabotaje)",
  "4": "Transporte de Carga (Internacional)",
  "5": "Pesca Comercial",
  "6": "Pesca Artesanal",
  "7": "Recreativas (Jetsky, Velero)",
  "8": "Submarinos Recreativos",
  "9": "Buceo Deportivo",
  "10": "Pesca Deportiva",
};

const ROATAN_PORT_ID = "port_2"; // Based on earlier research

async function importRoatanVessels() {
  console.log('--- Iniciando Importación de Roatán ---');
  
  const csvPath = path.join(process.cwd(), 'ROATAN.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('Error: No se encontró ROATAN.csv en la raíz del proyecto.');
    return;
  }

  // Read lines, split by semicolon
  const content = fs.readFileSync(csvPath, 'latin1'); // Using latin1 to handle most common Windows encodings for Spanish
  const lines = content.split('\n');

  console.log(`Total de líneas leídas: ${lines.length}`);

  // Skip preamble (lines 0, 1, 2)
  // Line 2 is headers (0-indexed)
  const dataLines = lines.slice(3);
  
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const columns = line.split(';');
    
    // Mapping based on research:
    // 0: MATRICULA
    // 1: NOMBRE DE LA EMBARCACION
    // 2: NOMBRE DEL PROPIETARIO
    // 3: IDENTIDAD / RTN
    // 4: ESLORA
    // 5: MANGA
    // 6: PUNTAL
    // 7: TONELAJE BRUTO
    // 8: TONELAJE NETO

    const registrationNumber = columns[0]?.trim();
    const vesselName = columns[1]?.trim();
    const ownerName = columns[2]?.trim();
    const identityOrRtn = columns[3]?.trim();
    const eslora = columns[4]?.trim();
    const manga = columns[5]?.trim();
    const punta = columns[6]?.trim();
    const grossTonnage = columns[7]?.trim();
    const netTonnage = columns[8]?.trim();

    if (!registrationNumber || !vesselName) {
      console.log(`[Línea ${i + 4}] Saltando por falta de matrícula o nombre.`);
      continue;
    }

    // Determine activity from matricula (e.g. RO-1-001 -> 1)
    const parts = registrationNumber.split('-');
    let activityCode = "0";
    if (parts.length >= 2) {
      activityCode = parts[1];
    }
    const activityType = ACTIVITY_MAP[activityCode] || "Otro";

    try {
      // Check for duplicate
      const existing = await prisma.vesselRegistration.findUnique({
        where: { registrationNumber }
      });

      if (existing) {
        // console.log(`[Línea ${i + 4}] Registro duplicado: ${registrationNumber}. Saltando.`);
        skippedCount++;
        continue;
      }

      // Create new registration
      await prisma.vesselRegistration.create({
        data: {
          registrationNumber,
          vesselName,
          ownerName,
          ownerId: identityOrRtn?.startsWith('RTN') ? null : identityOrRtn,
          rtn: identityOrRtn?.startsWith('RTN') ? identityOrRtn : null,
          eslora,
          manga,
          punta,
          grossTonnage,
          netTonnage,
          activityType,
          activityCode: parseInt(activityCode) || 0,
          vesselType: "Otro", // Default
          portId: ROATAN_PORT_ID,
          status: "ACTIVE",
          qrCode: `DGMM-REG-LEGACY-${registrationNumber}`,
          issueDate: new Date(),
        }
      });

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`Progreso: ${successCount} registros importados...`);
      }
    } catch (err: any) {
      console.error(`Error procesando línea ${i + 4} (${registrationNumber}):`, err.message);
      errorCount++;
    }
  }

  console.log('\n--- Resumen de Importación ---');
  console.log(`Éxito: ${successCount}`);
  console.log(`Duplicados saltados: ${skippedCount}`);
  console.log(`Errores: ${errorCount}`);
  console.log('------------------------------');
}

importRoatanVessels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
