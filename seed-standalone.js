require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const portsData = [
      'CORTÉS', 'ROATÁN', 'LA CEIBA', 'TELA', 'UTILA', 'GUANAJA', 'TRUJILLO', 
      'BRUS LAGUNA', 'OMOA', 'AMAPALA', 'FERRYS Y CRUCEROS', 'PUERTO LEMPIRA', 
      'GUAPINOL', 'SAN LORENZO', 'JOSE SANTOS GUARDIOLA'
    ];

    for (const name of portsData) {
      try {
        await prisma.port.create({
          data: { name, id: name.replace(/[^A-Z\\s]/g, '').replace(/\\s+/g, '_').toUpperCase() }
        });
        console.log(`Created port: ${name}`);
      } catch (e) {
        console.log(`Port ${name} already exists, skipping`);
      }
    }

    // CIM user
    await prisma.user.upsert({
      where: { email: 'cim@digitalacma.com' },
      update: {},
      create: {
        id: 'cim-user',
        email: 'cim@digitalacma.com',
        name: 'CIM Admin',
        role: 'CIM',
        password: 'cim123'
      }
    });
    console.log('CIM user created/updated');

    // CAPITAN user
    const cortesPort = await prisma.port.findUnique({ where: { name: 'CORTÉS' } });
    if (cortesPort) {
      await prisma.user.upsert({
        where: { email: 'capitan@digitalacma.com' },
        update: {},
        create: {
          id: 'capitan-cortes',
          email: 'capitan@digitalacma.com',
          name: 'Capitán Cortés',
          role: 'CAPITAN',
          portId: cortesPort.id,
          password: 'capitan123'
        }
      });
      console.log('CAPITAN user created/updated');
    }

    const portsCount = await prisma.port.count();
    const usersCount = await prisma.user.count();
    console.log(`Final counts - Ports: ${portsCount}, Users: ${usersCount}`);
  } catch (e) {
    console.error('Seed error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
