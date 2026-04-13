import { getPrismaClient } from "../src/lib/db";

async function check() {
  const prisma = getPrismaClient();
  try {
    const lastZarpe = await prisma.zarpeRequest.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, signature: true, vesselName: true }
    });
    console.log('Last Zarpe:', lastZarpe);

    const lastInfoRes = await prisma.informationRequest.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, signature: true, subject: true }
    });
    console.log('Last Info Request:', lastInfoRes);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // prisma doesn't need explicit disconnect usually in this project's pattern but safe to do
  }
}

check();
