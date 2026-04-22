const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  // Check if port already exists
  const existing = await prisma.port.findFirst({ where: { name: 'PLACER' } });
  if (existing) {
    console.log('Puerto PLACER ya existe:', JSON.stringify(existing, null, 2));
    return;
  }

  const port = await prisma.port.create({
    data: {
      id: 'port_17',
      name: 'PLACER',
      location: null,
    }
  });
  console.log('Puerto creado:', JSON.stringify(port, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
