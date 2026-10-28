import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const rawConnectionString = process.env.DATABASE_URL?.trim()

if (!rawConnectionString) {
  throw new Error('DATABASE_URL is not defined')
}

// In Next.js, we must use a global variable to preserve the client across HMR
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: Pool
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: rawConnectionString,
    max: 10, // Pooling for stability
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

  // Set pool to global to avoid draining issues on HMR
  globalForPrisma.pool = pool

  const adapter = new PrismaPg(pool as any)
  return new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  })
}

export const prisma = createPrismaClient()

/*
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
*/

export function getPrismaClient() {
  return prisma
}
