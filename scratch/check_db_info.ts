import { prisma } from '../src/lib/db';

async function main() {
  const ports = await prisma.port.findMany();
  console.log('Ports found:');
  console.log(JSON.stringify(ports, null, 2));

  const vessels = await prisma.vesselRegistration.findMany({
    take: 5,
    include: { port: true }
  });
  console.log('Sample vessels:');
  console.log(JSON.stringify(vessels, null, 2));
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
