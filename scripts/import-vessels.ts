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

async function importVessels() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Uso: npx tsx scripts/import-vessels.ts <archivo.csv> <portId>');
    process.exit(1);
  }

  const [filename, targetPortId] = args;
  const isCortes = filename.toUpperCase().includes('CORTES');

  console.log(`--- Iniciando Importación: ${filename} (Puerto: ${targetPortId}) ---`);
  
  const csvPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: No se encontró ${filename} en la raíz del proyecto.`);
    return;
  }

  // Read lines, split by semicolon
  const content = fs.readFileSync(csvPath, 'latin1'); 
  const lines = content.split('\n');

  console.log(`Total de líneas leídas: ${lines.length}`);

  // Skip preamble (lines 0, 1, 2)
  const dataLines = lines.slice(3);
  
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const columns = line.split(';');
    
    const registrationNumber = columns[0]?.trim();
    const vesselName = columns[1]?.trim();
    const ownerName = columns[2]?.trim();
    const identityOrRtn = columns[3]?.trim();

    // Cortes uses different column indices for dimensions
    const eslora = isCortes ? columns[11]?.trim() : columns[4]?.trim();
    const manga  = isCortes ? columns[12]?.trim() : columns[5]?.trim();
    const punta  = isCortes ? columns[13]?.trim() : columns[6]?.trim();
    const grossTonnage = isCortes ? columns[14]?.trim() : columns[7]?.trim();
    const netTonnage = isCortes ? columns[15]?.trim() : columns[8]?.trim();

    if (!registrationNumber || !vesselName) {
      continue;
    }

    // Determine activity from matricula 
    // Format 1 (3 parts): RO-1-001 -> activity is parts[1]
    // Format 2 (4 parts): UT-03-001-7 -> activity is parts[3]
    const parts = registrationNumber.split('-');
    let activityCode = "0";
    if (parts.length === 4) {
      activityCode = parts[3];
    } else if (parts.length === 3) {
      activityCode = parts[1];
    }
    const activityType = ACTIVITY_MAP[activityCode] || "Otro";

    try {
      // Check for duplicate
      const existing = await prisma.vesselRegistration.findUnique({
        where: { registrationNumber }
      });

      if (existing) {
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
          vesselType: "Otro", 
          portId: targetPortId,
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

  console.log(`\n--- Resumen de Importación (${filename}) ---`);
  console.log(`Éxito: ${successCount}`);
  console.log(`Duplicados saltados: ${skippedCount}`);
  console.log(`Errores: ${errorCount}`);
  console.log('-------------------------------------------');
}

importVessels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
