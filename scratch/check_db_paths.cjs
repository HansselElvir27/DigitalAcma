const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        const lastZarpe = await prisma.zarpeRequest.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { id: true, signature: true, captainSignature: true }
        });
        console.log('Last Zarpe:', JSON.stringify(lastZarpe, null, 2));

        const lastVessel = await prisma.vesselRegistration.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { id: true, vesselPhotos: true }
        });
        console.log('Last Vessel:', JSON.stringify(lastVessel, null, 2));

    } catch (e) {
        console.error('Error reading DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
