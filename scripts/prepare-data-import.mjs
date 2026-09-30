import { DatabaseSync } from 'node:sqlite';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const tables = ['anonymous_outcomes', 'audit_events', 'dashboard_login_throttles',
  'dashboard_users', 'estimates', 'maintenance_runs', 'marketing_suppressions'];
const quoteName = value => '"' + value.replaceAll('"', '""') + '"';
const literal = value => {
  if (value === null) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'string' && !value.includes('\0')) return "'" + value.replaceAll("'", "''") + "'";
  throw new Error('Unsupported cell value; obtain a complete JSON export.');
};

// Input: { project_id, captured_at, pages: [unmodified structured table-page responses] }.
export async function prepareImport(snapshot) {
  if (snapshot.project_id !== 'appgprj_6a67d9738f488191a40a28867d4521f4' ||
      !Number.isFinite(Date.parse(snapshot.captured_at)) || !Array.isArray(snapshot.pages)) {
    throw new Error('Expected a timestamped production snapshot with complete table pages.');
  }
  const db = new DatabaseSync(':memory:');
  try {
    const dir = new URL('../drizzle/', import.meta.url);
    for (const file of (await readdir(dir)).filter(x => x.endsWith('.sql')).sort()) {
      db.exec(await readFile(new URL(file, dir), 'utf8'));
    }
    const sql = ['-- PRIVATE DATA: do not commit, upload as an artifact, or share publicly.',
      '-- Data only. Apply the repository schema first to an empty migration database.'];
    const counts = {};
    for (const page of snapshot.pages) {
      if (!tables.includes(page.table_name)) throw new Error('Unexpected table in snapshot.');
    }
    for (const table of tables) {
      const pages = snapshot.pages.filter(p => p.table_name === table);
      if (!pages.length) throw new Error(`Missing table: ${table}`);
      const columns = db.prepare(`PRAGMA table_info(${quoteName(table)})`).all().map(c => c.name);
      let next = 0, count = 0;
      for (const page of pages) {
        const m = page.model_projection;
        if (page.project_id !== snapshot.project_id || page.binding_name !== 'DB' ||
            next === null || page.offset !== next || !m || m.truncated || m.truncated_values ||
            m.omitted_columns || m.omitted_rows || !Array.isArray(page.rows) ||
            !Array.isArray(page.columns) || page.columns.length !== columns.length ||
            page.columns.some(c => !columns.includes(c))) throw new Error(`Incomplete or truncated page: ${table}`);
        for (const row of page.rows) {
          const keys = Object.keys(row);
          if (keys.length !== columns.length || keys.some(c => !columns.includes(c))) {
            throw new Error(`Incomplete row: ${table}`);
          }
          const statement = `INSERT INTO ${quoteName(table)} (${columns.map(quoteName).join(',')}) VALUES (${columns.map(c => literal(row[c])).join(',')});`;
          // Local schema validation detects duplicates and missing/invalid required data.
          db.exec(statement);
          sql.push(statement);
          count++;
        }
        next = m.next_offset;
        if (page.has_more !== (next !== null) || (next !== null &&
            (!Number.isInteger(next) || next !== page.offset + page.rows.length || next <= page.offset))) {
          throw new Error(`Invalid pagination: ${table}`);
        }
      }
      if (next !== null) throw new Error(`More pages required: ${table}`);
      counts[table] = count;
    }
    if (!counts.dashboard_users) throw new Error('No dashboard accounts in source snapshot.');
    return { sql: sql.join('\n') + '\n', counts };
  } finally { db.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output || !resolve(output).includes('/migration-private/')) {
    throw new Error('Usage: node scripts/prepare-data-import.mjs INPUT.json migration-private/import.sql');
  }
  const result = await prepareImport(JSON.parse(await readFile(input, 'utf8')));
  await mkdir(dirname(resolve(output)), { recursive: true, mode: 0o700 });
  await writeFile(output, result.sql, { mode: 0o600, flag: 'wx' });
  console.log(JSON.stringify({ file: output, rows: result.counts }));
}
