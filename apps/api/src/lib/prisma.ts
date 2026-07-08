import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client that auto-selects the correct database:
 *  - Production (Railway): Turso libSQL via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 *  - Development (local):  SQLite via DATABASE_URL=file:./dev.db
 *
 * Uses synchronous require() so the singleton is ready immediately at module load,
 * allowing all controllers to import it directly without async/await.
 */
function createPrisma(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');

    const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // Local dev: uses DATABASE_URL=file:./dev.db
  return new PrismaClient();
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances during hot-reload in development
if (!global.__prisma) {
  global.__prisma = createPrisma();
}

export const prisma = global.__prisma;
export default prisma;
