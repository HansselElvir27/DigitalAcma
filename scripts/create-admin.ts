import { getPrismaClient } from '../src/lib/db';

const prisma = getPrismaClient();

async function main() {
  const email = 'admin@digitalacma.com';
  const name = 'Administrador Digital ACMA';
  const role = 'ADMIN';
  const password = 'admin2026';

  console.log(`Checking for admin user: ${email}...`);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role,
        name
      },
      create: {
        email,
        name,
        role,
        password
      }
    });

    console.log(`✅ Admin user ${user.email} created/updated successfully.`);
    console.log(`Role: ${user.role}`);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
