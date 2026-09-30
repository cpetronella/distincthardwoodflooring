import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readdir, readFile } from 'node:fs/promises';
import { prepareImport, tables } from '../scripts/prepare-data-import.mjs';

async function fixture() {
  const db = new DatabaseSync(':memory:');
  const dir = new URL('../drizzle/', import.meta.url);
  for (const file of (await readdir(dir)).filter(f => f.endsWith('.sql')).sort()) db.exec(await readFile(new URL(file, dir), 'utf8'));
  db.exec("INSERT INTO dashboard_users(username,display_name,password_salt,password_hash,password_updated_at) VALUES('synthetic','Test O''Brien','test-salt','test-hash','2026-09-30')");
  const snapshot = { project_id: 'appgprj_6a67d9738f488191a40a28867d4521f4', captured_at: '2026-09-30T23:00:00Z', pages: tables.map(table => ({
    project_id: 'appgprj_6a67d9738f488191a40a28867d4521f4', binding_name: 'DB', table_name: table,
    columns: db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name), rows: db.prepare(`SELECT * FROM ${table}`).all(),
    offset: 0, has_more: false, model_projection: { next_offset: null, truncated: false, truncated_values: 0, omitted_columns: 0, omitted_rows: 0 },
  })) };
  db.close(); return snapshot;
}
test('complete synthetic snapshot produces data-only SQL with escaped values', async () => {
  const result = await prepareImport(await fixture());
  assert.equal(result.counts.dashboard_users, 1);
  assert.match(result.sql, /Test O''Brien/);
  assert.doesNotMatch(result.sql, /DROP TABLE|DELETE FROM|password.*production/i);
});
test('incomplete, truncated and duplicated snapshots fail closed', async () => {
  for (const mutate of [s => s.pages.pop(), s => s.pages[0].model_projection.truncated = true,
    s => { s.pages[0].has_more = true; s.pages[0].model_projection.next_offset = 25; },
    s => s.pages.find(p => p.table_name === 'dashboard_users').rows.push(s.pages.find(p => p.table_name === 'dashboard_users').rows[0])]) {
    const snapshot = await fixture(); mutate(snapshot);
    await assert.rejects(prepareImport(snapshot));
  }
});
