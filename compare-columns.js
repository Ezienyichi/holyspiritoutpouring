// Read-only diagnostic: diff table columns between OLD_DATABASE_URL and
// NEW_DATABASE_URL, and print (never run) ALTER TABLE ... ADD COLUMN
// IF NOT EXISTS statements for columns that exist in OLD but not in NEW.

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
    `SELECT column_name, data_type, udt_name, character_maximum_length,
            numeric_precision, numeric_scale, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  const map = new Map();
  for (const row of rows) map.set(row.column_name, row);
  return map;
}

function formatType(col) {
  switch (col.data_type) {
    case 'character varying':
      return col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
    case 'character':
      return col.character_maximum_length ? `CHAR(${col.character_maximum_length})` : 'CHAR';
    case 'numeric':
      return col.numeric_precision != null && col.numeric_scale != null
        ? `NUMERIC(${col.numeric_precision}, ${col.numeric_scale})`
        : 'NUMERIC';
    case 'timestamp with time zone':
      return 'TIMESTAMPTZ';
    case 'timestamp without time zone':
      return 'TIMESTAMP';
    case 'double precision':
      return 'DOUBLE PRECISION';
    case 'ARRAY':
      return `${col.udt_name.replace(/^_/, '').toUpperCase()}[]`;
    default:
      return col.data_type.toUpperCase();
  }
}

function formatDefault(col) {
  if (!col.column_default) return '';
  if (col.column_default.includes('nextval(')) return ''; // serial sequence — not portable across DBs
  return ` DEFAULT ${col.column_default}`;
}

async function main() {
  const oldPool = new Pool({ connectionString: OLD_DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
  const newPool = new Pool({ connectionString: NEW_DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });

  const [oldTables, newTables] = await Promise.all([getTables(oldPool), getTables(newPool)]);
  const newTableSet = new Set(newTables);

  const statements = [];
  const notes = [];

  for (const table of oldTables) {
    if (!newTableSet.has(table)) {
      notes.push(`-- NOTE: table "${table}" exists in OLD but not in NEW at all — no ADD COLUMN statements generated for it.`);
      continue;
    }

    const [oldCols, newCols] = await Promise.all([getColumns(oldPool, table), getColumns(newPool, table)]);

    for (const [name, col] of oldCols) {
      if (!newCols.has(name)) {
        statements.push(
          `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${name}" ${formatType(col)}${formatDefault(col)};`
        );
      }
    }
  }

  console.log('-- Column diff: OLD_DATABASE_URL -> NEW_DATABASE_URL');
  console.log('-- Generated only. Nothing was executed.\n');

  if (statements.length === 0) {
    console.log('-- No missing columns found. NEW already has every column OLD has.');
  } else {
    console.log(statements.join('\n'));
  }

  if (notes.length) {
    console.log('\n' + notes.join('\n'));
  }

  await oldPool.end();
  await newPool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Comparison failed:', err);
  process.exit(1);
});
