import { ownerPool } from './pool';
import fs from 'fs';
import path from 'path';
// import { __dirname } from './pathHelper';

import { fileURLToPath } from 'url'; // 👈 Ye add karo

// // ESM mein __dirname nikalne ka tarika
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, '../migrations');
// ↑ "migrations" folder ka path. __dirname = src, ../migrations = packages/db/migrations.

async function runMigrations() {
  const client = await ownerPool.connect();
  // ↑ Owner role se connect karo (gasflow_owner).
  // Runtime app role (gasflow_app) tables nahi bana sakta.

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // ↑ Ek tracking table banao. Isme yaad rahega ki kaunsi migrations chali hain.
    // Agar table pehle se hai, toh "IF NOT EXISTS" skip kar dega.

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    // ↑ Migrations folder se saari .sql files padho, sort karo (0001 pehle, 0002 baad).

    for (const file of files) {
      const res = await client.query(
        'SELECT filename FROM schema_migrations WHERE filename = $1',
        [file]
      );
      // ↑ Check karo ki ye file pehle se chali hai kya.

      if (res.rowCount === 0) {
        console.log(`⏳ Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        // ↑ SQL file padho.

        await client.query('BEGIN');
        // ↑ Transaction start karo. Agar beech mein error aaye, sab rollback ho.

        try {
          await client.query(sql);
          // ↑ SQL chalao.

          await client.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1)',
            [file]
          );
          // ↑ Yaad rakho ki ye file chal gayi.

          await client.query('COMMIT');
          // ↑ Sab theek, save karo.

          console.log(`✅ Applied: ${file}`);
        } catch (e) {
          await client.query('ROLLBACK');
          console.error(`❌ Failed: ${file}`);
          throw e;
        }
      } else {
        console.log(`⏭️  Skipping (already applied): ${file}`);
      }
    }
    console.log('🎉 All migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    ownerPool.end();
  }
}

runMigrations();