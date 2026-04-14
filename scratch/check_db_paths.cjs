const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

const rawConnectionString = process.env.DATABASE_URL?.trim();

async function main() {
  if (!rawConnectionString) return;

  const pool = new Pool({ connectionString: rawConnectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const zarpes = await prisma.zarpeRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, crewListFile: true, passengerListFile: true, paymentReceiptFile: true }
    });
    
    fs.writeFileSync('scratch/db_paths.json', JSON.stringify(zarpes, null, 2), 'utf8');
    console.log('Wrote DB data to scratch/db_paths.json');

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
