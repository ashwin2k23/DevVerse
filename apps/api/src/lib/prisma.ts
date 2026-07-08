import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client that auto-selects the correct database:
 *  - Production (Railway): Turso libSQL via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 *  - Development (local):  SQLite via DATABASE_URL=file:./dev.db
 *
 * @prisma/adapter-libsql@6.19.3 uses a Factory pattern — it expects
 * a plain config object { url, authToken }, NOT a pre-created @libsql/client instance.
 */
function createPrisma(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');
    // Pass config object directly — adapter creates the @libsql/client internally
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
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
