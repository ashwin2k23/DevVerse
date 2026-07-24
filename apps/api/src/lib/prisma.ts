import { PrismaClient } from '@prisma/client';

/**
 * Clean up database URL strings by stripping wrapping quotes and whitespace.
 */
function cleanEnvVar(val: string | undefined): string | undefined {
  if (!val) return undefined;
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned || undefined;
}

/**
 * Singleton Prisma client that auto-selects the correct database driver:
 *  - Production (Railway/Turso): Turso libSQL via TURSO_DATABASE_URL / DATABASE_URL + TURSO_AUTH_TOKEN
 *  - Development (local): SQLite via DATABASE_URL=file:./dev.db
 */
function createPrisma(): PrismaClient {
  const tursoUrl = cleanEnvVar(process.env.TURSO_DATABASE_URL);
  const tursoToken = cleanEnvVar(process.env.TURSO_AUTH_TOKEN);
  const dbUrl = cleanEnvVar(process.env.DATABASE_URL);

  const activeUrl = tursoUrl || dbUrl;
  const isRemoteLibSql = activeUrl?.startsWith('libsql://') || activeUrl?.startsWith('https://') || activeUrl?.startsWith('wss://');

  if (isRemoteLibSql || (tursoUrl && tursoToken)) {
    const targetUrl = (tursoUrl || dbUrl)!;
    process.env.DATABASE_URL = targetUrl;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');

    const config: { url: string; authToken?: string } = { url: targetUrl };
    if (tursoToken) {
      config.authToken = tursoToken;
    }

    const adapter = new PrismaLibSQL(config);
    return new PrismaClient({ adapter } as any);
  }

  if (dbUrl) {
    process.env.DATABASE_URL = dbUrl;
  }

  // Local dev fallback
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

