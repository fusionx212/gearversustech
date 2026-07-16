/**
 * Local-only runner: maps AMAZON_CREATORS_API_* from UKAirConTracker .env.local
 * (read-only) onto AMZ_ID/AMZ_SECRET, then runs sync-amazon-products.mjs.
 * Never prints secret values. Never modifies UKAirConTracker.
 *
 *   node --env-file=.env scripts/_run-amazon-sync.mjs
 *   node --env-file=.env scripts/_run-amazon-sync.mjs --write
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = 'C:/Users/dalec/projects/ukaircontracker/.env.local';

function get(txt, key) {
  const m = txt.match(new RegExp(`^${key}=(.*)$`, 'm'));
  if (!m) return '';
  return m[1].trim().replace(/^["']|["']$/g, '');
}

const txt = readFileSync(src, 'utf8');
const id = get(txt, 'AMAZON_CREATORS_API_CLIENT_ID');
const secret = get(txt, 'AMAZON_CREATORS_API_CLIENT_SECRET');
if (!id || !secret) {
  console.error('Amazon Creators API keys missing from UKAirConTracker .env.local');
  process.exit(1);
}

const env = {
  ...process.env,
  AMZ_ID: id,
  AMZ_SECRET: secret,
};

console.log(
  `Mapped Amazon Creators keys (read-only): id_len=${id.length} secret_len=${secret.length}`
);
console.log('Partner tag in sync script: gearversustech-21');

const args = ['scripts/sync-amazon-products.mjs', ...process.argv.slice(2)];
const r = spawnSync(process.execPath, args, {
  env,
  cwd: root,
  encoding: 'utf8',
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
