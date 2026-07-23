import { prisma } from '../lib/prisma';

const userSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  coverUrl: true,
  bio: true,
  headline: true,
  location: true,
  website: true,
  resumeUrl: true,
  skills: true,
  role: true,
  level: true,
  streak: true,
  createdAt: true,
  _count: {
    select: {
      followers: true,
      following: true,
      projects: true,
      posts: true,
    },
  },
};

async function main() {
  console.log('Testing syncUser transaction on Turso...');
  try {
    const clerkId = 'test_clerk_id_' + Date.now();
    const username = 'test_username_' + Date.now();
    const email = 'test_email@example.com';
    const avatarUrl = 'https://example.com/avatar.png';

    const user = await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, username, email, avatarUrl },
      update: { avatarUrl },
      select: userSelect,
    });

    console.log('User synced:', user);
  } catch (error) {
    console.error('Error during syncUser simulation:', error);
  }
}

main();
