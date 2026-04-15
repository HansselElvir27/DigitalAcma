import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- Latest Info Requests ---");
  const requests = await prisma.informationRequest.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  
  requests.forEach(req => {
    console.log(`ID: ${req.id}`);
    console.log(`Attachments: ${req.attachments}`);
    console.log(`Response Attachments: ${req.responseAttachments}`);
    console.log("---");
  });

  console.log("\n--- Latest Vessel Registrations ---");
  const vessels = await prisma.vesselRegistration.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  vessels.forEach(v => {
    console.log(`ID: ${v.id}`);
    console.log(`Registration: ${v.registrationNumber}`);
    console.log(`Vessel Photos: ${JSON.stringify(v.vesselPhotos)}`);
    console.log(`Documents: ${JSON.stringify(v.documents)}`);
    console.log("---");
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
