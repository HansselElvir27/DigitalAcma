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
    console.log('--- Database Stats ---')
    console.log('User:', await prisma.user.count())
    console.log('Port:', await prisma.port.count())
    console.log('InformationRequest:', await prisma.informationRequest.count())
    console.log('ZarpeRequest:', await prisma.zarpeRequest.count())
    console.log('VesselRegistration:', await prisma.vesselRegistration.count())
    console.log('PaseSalida:', await prisma.paseSalida.count())
    console.log('BalizaDesactivacion:', await prisma.balizaDesactivacion.count())
    console.log('ArrivalNotice:', await prisma.arrivalNotice.count())
    console.log('ArrivalNoticeRecreational:', await prisma.arrivalNoticeRecreational.count())
  } catch (e) {
    console.error('Error getting stats:', e)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
