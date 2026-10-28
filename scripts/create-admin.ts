import { getPrismaClient } from '../src/lib/db';
import { hashPassword } from '../src/lib/password';

const prisma = getPrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@digitalacma.com';
  const name = 'Administrador Digital ACMA';
  const role = 'ADMIN';
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin2026';
  const password = hashPassword(rawPassword);

  console.log(`Checking for admin user: ${email}...`);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role,
        name,
        password
      },
      create: {
        email,
        name,
        role,
        password
      }
    });

    console.log(`✅ Admin user ${user.email} created/updated successfully with hashed credentials.`);
    console.log(`Role: ${user.role}`);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
