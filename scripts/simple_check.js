const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking InfoRequests...");
    const requests = await prisma.informationRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    
    requests.forEach(r => {
        console.log(`ID: ${r.id}`);
        console.log(`Attachments: ${JSON.stringify(r.attachments)}`);
    });

    console.log("\nChecking Vessel Registrations...");
    const vessels = await prisma.vesselRegistration.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    vessels.forEach(v => {
        console.log(`Vessel: ${v.vesselName}`);
        console.log(`Photos: ${JSON.stringify(v.vesselPhotos)}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
