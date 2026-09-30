import { readFile, writeFile } from 'node:fs/promises';
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId ?? '')) {
  throw new Error('Set CLOUDFLARE_D1_DATABASE_ID to the new migration database UUID. Do not use the Sites database.');
}
const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
config.d1_databases[0].database_id = databaseId;
await writeFile('wrangler.jsonc', JSON.stringify(config, null, 2) + '\n');
