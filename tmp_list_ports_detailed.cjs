const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')
require('dotenv').config()

const url = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString: url })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const ports = await prisma.port.findMany({
    orderBy: { id: 'asc' }
  })
  console.log('--- CURRENT PORTS ---')
  ports.forEach(p => console.log(`${p.id}: ${p.name}`))
  await prisma.$disconnect()
  await pool.end()
}

main()
