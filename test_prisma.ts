import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function test() {
  let prisma;
  try {
    prisma = new PrismaClient();
    console.log('PrismaClient instance created successfully');
  } catch (err: any) {
    console.error('CRITICAL: Prisma constructor failed:', err);
    process.exit(1);
  }
  
  try {
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Result:', result);
    console.log('Query took:', Date.now() - start, 'ms');
  } catch (err: any) {
    console.error('Prisma test error:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

test();
