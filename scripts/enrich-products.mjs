/**
 * Upsert quality enrichment onto gvt_affiliate_links (scores, reviews, usage, etc).
 *
 *   node --env-file=.env scripts/enrich-products.mjs
 *   node --env-file=.env scripts/enrich-products.mjs --dry
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DRY = process.argv.includes('--dry');
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(join(__dirname, 'data', 'product-enrichment.json'), 'utf8')
);

async function sb(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

let ok = 0;
let missing = 0;
for (const [link_key, e] of Object.entries(data)) {
  const mockup = `/images/mockups/${link_key}.webp`;
  const patch = {
    score_out_of_10: e.score_out_of_10,
    honest_take: e.honest_take,
    review_summary: e.review_summary,
    review_themes: e.review_themes ?? [],
    buy_reasons: e.buy_reasons ?? [],
    usage_ideas: e.usage_ideas ?? [],
    drawbacks: e.drawbacks ?? [],
    stats: e.stats ?? {},
    mockup_url: mockup,
    updated_at: new Date().toISOString(),
  };
  console.log(
    `${link_key} score=${e.score_out_of_10} themes=${(e.review_themes || []).length} usage=${(e.usage_ideas || []).length}`
  );
  if (DRY) continue;
  const out = await sb(`gvt_affiliate_links?link_key=eq.${encodeURIComponent(link_key)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!out?.length) {
    console.warn(`  MISSING row for ${link_key} — skipping insert (enrich only existing)`);
    missing++;
  } else {
    ok++;
  }
}
console.log(DRY ? 'Dry run done' : `Patched ${ok} rows; missing ${missing}`);
