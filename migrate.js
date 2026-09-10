// One-off script: copy every row from OLD_DATABASE_URL into NEW_DATABASE_URL.
// Usage: see README instructions printed by the assistant, or run `node migrate.js`.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const { OLD_DATABASE_URL, NEW_DATABASE_URL } = process.env;

if (!OLD_DATABASE_URL || !NEW_DATABASE_URL) {
  console.error('Missing OLD_DATABASE_URL or NEW_DATABASE_URL in .env');
  process.exit(1);
}

// Tables in parent-first order. This schema has no FOREIGN KEY constraints
// (verified against server/db/database.js), so order is not load-bearing,
// but it's kept sensible in case constraints are added later.
const TABLES = [
  'config',
  'users',
  'speakers',
  'sessions',
  'media',
  'prayers',
  'giving',
  'registrations',
  'chat',
  'previous_events',
  'past_ministers',
  'sponsors',
  'testimonials',
];

async function resetSequence(query, table) {
  await query(
    `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), COALESCE((SELECT MAX(id) FROM "${table}"), 0) > 0)`
  );
}

async function copyTable(oldPool, newQuery, table) {
  const { rows } = await oldPool.query(`SELECT * FROM "${table}" ORDER BY id`);

  let copied = 0;
  for (const row of rows) {
    const columns = Object.keys(row);
    const colList = columns.map(c => `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const values = columns.map(c => row[c]);

    const result = await newQuery(
      `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values
    );
    copied += result.rowCount;
  }

  await resetSequence(newQuery, table);
  console.log(`  ${table}: ${copied}/${rows.length} rows copied`);
  return copied;
}

async function main() {
  // 1. Point the existing database module at the NEW database and let its
  // own initializeDatabase() (auto-run on require) create all tables there.
  process.env.DATABASE_URL = NEW_DATABASE_URL;
  const newDb = require('./server/db/database');
  console.log('Creating schema on NEW database...');
  await newDb.dbReady;
  console.log('Schema ready.\n');

  // 2. Wipe whatever initializeDatabase()'s seed() step inserted into the
  // fresh NEW database, so the real rows copied below don't collide with
  // seed data on primary keys/unique constraints.
  console.log('Clearing seed data from NEW database...');
  await newDb.query(`TRUNCATE TABLE ${TABLES.map(t => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`);

  // 3. Connect to OLD database and copy every table across.
  const oldPool = new Pool({
    connectionString: OLD_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
  });

  console.log('Copying rows from OLD database...');
  let total = 0;
  for (const table of TABLES) {
    total += await copyTable(oldPool, newDb.query, table);
  }

  await oldPool.end();
  console.log(`\ndone (${total} total rows copied across ${TABLES.length} tables)`);
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
