const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const registrations = await prisma.vesselRegistration.findMany({
        select: { registrationNumber: true, portId: true }
    });
    console.log(JSON.stringify(registrations, null, 2));
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
