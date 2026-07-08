import { prisma } from '../lib/prisma';

async function main() {
  console.log('Testing Turso connection via Prisma...');
  try {
    const usersCount = await prisma.user.count();
    console.log('Users count:', usersCount);
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Users:', users);
  } catch (err: any) {
    console.error('Error during query:', err);
  }
}

main();
