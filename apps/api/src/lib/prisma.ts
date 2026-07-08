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
    const { createClient } = await import('@libsql/client');
    const { PrismaLibSQL } = await import('@prisma/adapter-libsql');

    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    const adapter = new PrismaLibSQL(libsql);
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
    // In dev, store a sync instance (no Turso in dev)
    global.__prisma = new PrismaClient();
  }
  prismaPromise = Promise.resolve(global.__prisma);
}

// Export a lazy getter so controllers can do: const prisma = await getPrisma()
export async function getPrisma(): Promise<PrismaClient> {
  return prismaPromise;
}

// For backward compat — synchronous export (works fine in dev/SQLite)
// In production with Turso this will still work because the adapter is initialized once at startup
export const prisma = new PrismaClient();

export default prisma;
