import { getPrismaClient } from './src/lib/db';

const prisma = getPrismaClient();

async function test() {
  console.log('Testing prisma client...');
  console.log('Models available:', Object.keys(prisma).filter(k => !k.startsWith('_')));
  
  if (prisma.notification) {
    console.log('SUCCESS: prisma.notification is DEFINED');
    try {
      const count = await prisma.notification.count();
      console.log('Notification count:', count);
    } catch (err: any) {
      console.error('Error querying notification:', err.message);
    }
  } else {
    console.error('ERROR: prisma.notification is UNDEFINED');
  }
}

test().finally(() => process.exit());
