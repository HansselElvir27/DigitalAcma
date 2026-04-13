const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    const lastZarpe = await prisma.zarpeRequest.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        signature: true, 
        passengerListFile: true,
        crewListFile: true,
        createdAt: true 
      }
    });

    console.log('--- LAST ZARPE ---');
    console.log(JSON.stringify(lastZarpe, null, 2));

    const lastVessel = await prisma.vesselRegistration.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        vesselPhotos: true,
        paymentPhoto: true,
        createdAt: true 
      }
    });

    console.log('--- LAST VESSEL ---');
    console.log(JSON.stringify(lastVessel, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
