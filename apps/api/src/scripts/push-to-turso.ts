import { createClient } from '@libsql/client';
import { execSync } from 'child_process';
import path from 'path';

// Get target credentials from environment variables
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error('Error: Please provide TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.');
  process.exit(1);
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

async function main() {
  console.log('Generating migration SQL via Prisma...');
  const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
  
  const sql = execSync(
    `npx prisma migrate diff --from-empty --to-schema-datamodel "${schemaPath}" --script`,
    { encoding: 'utf-8' }
  );

  console.log('Connecting to Turso...');
  
  // Split SQL statements by semicolon
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      if (s.length === 0) return false;
      // Filter out Prisma CLI logs
      if (s.includes('Environment variables loaded') || s.includes('Prisma schema loaded')) {
        return false;
      }
      // Must look like SQL
      return s.toUpperCase().includes('CREATE TABLE') || s.toUpperCase().includes('CREATE INDEX') || s.toUpperCase().includes('CREATE UNIQUE INDEX');
    });

  console.log(`Executing ${statements.length} schema statements on Turso...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
      console.log(`[${i + 1}/${statements.length}] Done`);
    } catch (err: any) {
      // If table already exists, log warning and continue
      if (err.message && err.message.includes('already exists')) {
        console.warn(`[${i + 1}/${statements.length}] Table/Index already exists (Skipped)`);
      } else {
        console.error(`[${i + 1}/${statements.length}] Error executing statement:`, stmt);
        console.error(err);
        process.exit(1);
      }
    }
  }

  console.log('Schema successfully synced to Turso database!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Unhandled error during sync:', err);
  process.exit(1);
});
