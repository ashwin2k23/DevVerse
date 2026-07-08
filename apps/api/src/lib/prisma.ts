import { PrismaClient } from '@prisma/client';

// Singleton Prisma client that supports:
//  - Local dev: SQLite via file:./dev.db
//  - Production: Turso (libSQL) via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
//
// In production, set both TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.
// In local dev, just DATABASE_URL=file:./dev.db is enough.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

async function createPrismaClient(): Promise<PrismaClient> {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // Production: use Turso libSQL adapter
    // PrismaLibSQL accepts a config object { url, authToken }, NOT a client instance
    const { PrismaLibSQL } = await import('@prisma/adapter-libsql');

    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken,
    });

    return new PrismaClient({ adapter } as any);
  }

  // Development: standard SQLite via DATABASE_URL
  return new PrismaClient();
}

// Prevent multiple instances during hot-reload in development
let prismaPromise: Promise<PrismaClient>;

if (process.env.NODE_ENV === 'production') {
  prismaPromise = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prismaPromise = Promise.resolve(global.__prisma);
}

export async function getPrisma(): Promise<PrismaClient> {
  return prismaPromise;
}

// Synchronous singleton — always valid for dev and production startup
export const prisma = global.__prisma ?? new PrismaClient();

export default prisma;
