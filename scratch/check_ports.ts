import { prisma } from '../src/lib/db';

async function main() {
  const ports = await prisma.port.findMany();
  console.log(JSON.stringify(ports, null, 2));
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
