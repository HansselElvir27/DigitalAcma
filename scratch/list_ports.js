const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPort() {
  try {
    const ports = await prisma.port.findMany();
    console.log(JSON.stringify(ports, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPort();
