const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma = new PrismaClient();
  try {
    const last = await prisma.zarpeRequest.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
          id: true,
          vesselName: true,
          captainLicense: true,
          carriesOnBoardAttachment: true,
          crewListFile: true
      }
    });
    console.log("LAST RECORD:", JSON.stringify(last, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
