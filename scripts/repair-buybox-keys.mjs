/**
 * Align gvt_affiliate_links.link_key with slugify(product_name) and
 * normalize article winner/runner names so buy boxes resolve.
 * Also clone rows under alternate keys when product_name and legacy key diverge.
 *
 *   node --env-file=.env scripts/repair-buybox-keys.mjs
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const h = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function sb(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...h, ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

const links = await sb('gvt_affiliate_links?select=*');
const byKey = new Map(links.map((l) => [l.link_key, l]));
const clones = [];

for (const row of links) {
  const expected = slugify(row.product_name);
  if (expected && expected !== row.link_key && !byKey.has(expected)) {
    clones.push({
      link_key: expected,
      product_name: row.product_name,
      amazon_asin: row.amazon_asin,
      uk_price_gbp: row.uk_price_gbp,
      image_url: row.image_url,
    });
    byKey.set(expected, true);
    console.log('CLONE', row.link_key, '->', expected);
  }
}

// Known name aliases used in articles → canonical product_name already in DB
const NAME_FIXES = [
  { from: 'Homey Pro (2026 Edition)', to: 'Homey Pro (2026)' },
  { from: 'HyperX Cloud III', to: 'HyperX Cloud III Wireless' },
  { from: 'Philips Hue Play Sync Box 8K', to: 'Philips Hue Play Sync Box 8K' },
];

if (clones.length) {
  await sb('gvt_affiliate_links?on_conflict=link_key', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(clones),
  });
  console.log('Upserted', clones.length, 'clone keys');
}

const arts = await sb('gvt_articles?select=slug,winner_name,runnerup_name');
let fixed = 0;
for (const art of arts) {
  let winner_name = art.winner_name;
  let runnerup_name = art.runnerup_name;
  for (const f of NAME_FIXES) {
    if (winner_name === f.from) winner_name = f.to;
    if (runnerup_name === f.from) runnerup_name = f.to;
  }
  if (winner_name !== art.winner_name || runnerup_name !== art.runnerup_name) {
    const res = await fetch(`${URL}/rest/v1/gvt_articles?slug=eq.${encodeURIComponent(art.slug)}`, {
      method: 'PATCH',
      headers: { ...h, Prefer: 'return=minimal' },
      body: JSON.stringify({ winner_name, runnerup_name }),
    });
    console.log(res.ok ? 'FIX' : 'FAIL', art.slug, winner_name, runnerup_name);
    if (res.ok) fixed++;
  }
}
console.log('DONE clones', clones.length, 'name fixes', fixed);
