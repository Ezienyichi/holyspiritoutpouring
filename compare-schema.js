// Read-only diagnostic: connects to OLD_DATABASE_URL and NEW_DATABASE_URL,
// diffs information_schema.columns per table, and prints (never runs)
// ALTER TABLE ... ADD COLUMN IF NOT EXISTS statements for columns that
// exist in OLD but are missing in NEW.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const { OLD_DATABASE_URL, NEW_DATABASE_URL } = process.env;

if (!OLD_DATABASE_URL || !NEW_DATABASE_URL) {
  console.error('Missing OLD_DATABASE_URL or NEW_DATABASE_URL in .env');
  process.exit(1);
}

async function getTables(pool) {
  const { rows } = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return rows.map(r => r.table_name);
}

async function getColumns(pool, table) {
  const { rows } = await pool.query(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  const map = new Map();
  for (const row of rows) map.set(row.column_name, row.data_type);
  return map;
}

async function main() {
  const oldPool = new Pool({ connectionString: OLD_DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
  const newPool = new Pool({ connectionString: NEW_DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });

  const [oldTables, newTables] = await Promise.all([getTables(oldPool), getTables(newPool)]);
  const newTableSet = new Set(newTables);

  const statements = [];

  for (const table of oldTables) {
    if (!newTableSet.has(table)) continue; // whole table missing in NEW — can't ADD COLUMN to a table that doesn't exist

    const [oldCols, newCols] = await Promise.all([getColumns(oldPool, table), getColumns(newPool, table)]);

    for (const [column, dataType] of oldCols) {
      if (!newCols.has(column)) {
        statements.push(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${dataType};`);
      }
    }
  }

  if (statements.length === 0) {
    console.log('-- No missing columns found. NEW already has every column OLD has.');
  } else {
    console.log(statements.join('\n'));
  }

  await oldPool.end();
  await newPool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Comparison failed:', err);
  process.exit(1);
});
