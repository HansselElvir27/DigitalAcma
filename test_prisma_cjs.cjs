const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test() {
  const url = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const start = Date.now();
    const result = await prisma.$queryRawUnsafe('SELECT NOW()');
    console.log('Result:', result);
    console.log('Query took:', Date.now() - start, 'ms');
  } catch (err) {
    console.error('Prisma CJS Error:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

test();
