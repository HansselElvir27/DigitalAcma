const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')
require('dotenv').config()

const url = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString: url })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    const portCount = await prisma.port.count()
    console.log(`Port count: ${portCount}`)
    const ports = await prisma.port.findMany({ take: 5 })
    console.log('Sample ports:', JSON.stringify(ports, null, 2))
    
    const userCount = await prisma.user.count()
    console.log(`User count: ${userCount}`)
  } catch (e) {
    console.error('Error listing ports:', e)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
