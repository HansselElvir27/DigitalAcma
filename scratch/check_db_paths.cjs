const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const rawConnectionString = process.env.DATABASE_URL?.trim();

async function main() {
  if (!rawConnectionString) {
    console.error('DATABASE_URL is not defined');
    return;
  }

  const pool = new Pool({
    connectionString: rawConnectionString,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('--- Checking ZarpeRequest attachments ---');
    const zarpes = await prisma.zarpeRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, crewListFile: true, passengerListFile: true, paymentReceiptFile: true }
    });
    console.log(JSON.stringify(zarpes, null, 2));

    console.log('\n--- Checking VesselRegistration (Json fields) ---');
    const vessels = await prisma.vesselRegistration.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, vesselPhotos: true, documents: true, paymentPhoto: true }
    });
    console.log(JSON.stringify(vessels, null, 2));

  } catch (e) {
    console.error('Error querying DB:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
