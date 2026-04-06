import 'dotenv/config';
import { getPrismaClient } from '../src/lib/db';

const prisma = getPrismaClient();

async function main() {
  console.log('--- DB CLEANUP & PORTS SEED (16) ---');

  // Skip deep cleanup (deleting all records) unless confirmed by user?
  // But user said "only the ports ... should remain", which implies clearing.
  // I will clear related data that HAS portId first.
  
  try {
    const deletedVessels = await prisma.vesselRegistration.deleteMany({});
    const deletedInscripciones = await prisma.embarcacionInscripcionRequest.deleteMany({});
    const deletedZarpes = await prisma.zarpeRequest.deleteMany({});
    console.log(`Cleanup: Deleted ${deletedVessels.count} vessels, ${deletedInscripciones.count} inscripciones, ${deletedZarpes.count} zarpes.`);
    
    // Cleanup users with potentially broken portIds
    await prisma.user.deleteMany({
      where: { role: { notIn: ['CIM', 'CAPITAN', 'ADMIN'] } }
    });
    
    await prisma.port.deleteMany({});
    console.log('Cleanup: Deleted all existing port records.');
  } catch (err: any) {
    console.warn('Cleanup warning (might be safe if tables are empty):', err.message);
  }

  // 16 Ports List
  const ports = [
    'CORTÉS', 'ROATÁN', 'LA CEIBA', 'TELA', 'UTILA', 
    'GUANAJA', 'TRUJILLO', 'BRUS LAGUNA', 'OMOA', 'AMAPALA', 
    'FERRYS Y CRUCEROS', 'PUERTO LEMPIRA', 'GUAPINOL', 'SAN LORENZO', 
    'JOSE SANTOS GUARDIOLA', 'PUERTO CASTILLA'
  ];

  for (let i = 0; i < ports.length; i++) {
    const id = `port_${i + 1}`;
    const name = ports[i];
    await prisma.port.create({
      data: { id, name }
    });
    console.log(`Created: ${id} -> ${name}`);
  }

  // Admin users
  await prisma.user.upsert({
    where: { email: 'cim@digitalacma.com' },
    update: { id: 'admin-cim' },
    create: {
      id: 'admin-cim',
      email: 'cim@digitalacma.com',
      name: 'CIM Admin',
      role: 'CIM',
      password: 'cim123'
    }
  });

  await prisma.user.upsert({
    where: { email: 'capitan@digitalacma.com' },
    update: { portId: 'port_1' },
    create: {
      id: 'capitan-cortes',
      email: 'capitan@digitalacma.com',
      name: 'Capitán Cortés',
      role: 'CAPITAN',
      portId: 'port_1',
      password: 'capitan123'
    }
  });

  console.log('✅ Seed complete: 16 ports + users verified.');
}

main()
  .catch(e => {
    console.error('Seed error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
