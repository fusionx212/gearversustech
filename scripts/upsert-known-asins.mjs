/**
 * Manual ASIN upserts for known buy-box gaps (D2C skip / search miss).
 * Prices/images filled when Creators API GetItems works; otherwise ASIN-only
 * so click-tracker + Amazon CDN image fallback can still work.
 *
 *   node --env-file=.env scripts/upsert-known-asins.mjs
 *   node --env-file=.env scripts/upsert-known-asins.mjs --with-api
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const WRITE = !process.argv.includes('--dry');
const WITH_API = process.argv.includes('--with-api');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Only ASINs verified from prior GVT research / live Amazon UK pages.
 * Do NOT invent ASINs — qa-affiliate-links historically caught fabricated ones.
 * Gym generics stay empty until Creators search or Dale supplies ASINs.
 */
const KNOWN = [
  { product_name: 'Wooting 60HE', amazon_asin: 'B0DJY46XTF' },
  { product_name: 'Razer Viper V3 Pro', amazon_asin: 'B0CXL5V4VH' },
  { product_name: 'Samsung SmartThings Station', amazon_asin: 'B0CD2F5L8H' },
];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function sb(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

function mapAmzEnv() {
  try {
    const txt = readFileSync('C:/Users/dalec/projects/ukaircontracker/.env.local', 'utf8');
    const get = (k) => {
      const m = txt.match(new RegExp(`^${k}=(.*)$`, 'm'));
      return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
    };
    process.env.AMZ_ID = get('AMAZON_CREATORS_API_CLIENT_ID');
    process.env.AMZ_SECRET = get('AMAZON_CREATORS_API_CLIENT_SECRET');
  } catch {
    /* optional */
  }
}

async function getToken() {
  const res = await fetch('https://api.amazon.co.uk/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AMZ_ID,
      client_secret: process.env.AMZ_SECRET,
      scope: 'creatorsapi::default',
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function getItems(token, asins) {
  const res = await fetch('https://creatorsapi.amazon/catalog/v1/getItems', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}, Version 3.2`,
      'x-marketplace': 'www.amazon.co.uk',
    },
    body: JSON.stringify({
      itemIds: asins,
      itemIdType: 'ASIN',
      marketplace: 'www.amazon.co.uk',
      partnerTag: 'gearversustech-21',
      resources: ['itemInfo.title', 'images.primary.large', 'offersV2.listings.price'],
    }),
  });
  return res.json();
}

mapAmzEnv();

let enrich = new Map();
if (WITH_API && process.env.AMZ_ID && process.env.AMZ_SECRET) {
  try {
    const token = await getToken();
    const asins = KNOWN.map((k) => k.amazon_asin);
    // batch of 10
    for (let i = 0; i < asins.length; i += 10) {
      const batch = asins.slice(i, i + 10);
      const json = await getItems(token, batch);
      const items = json?.itemsResult?.items ?? json?.items ?? [];
      for (const item of items) {
        const listing = item.offersV2?.listings?.[0];
        enrich.set(item.asin, {
          title: item.itemInfo?.title?.displayValue ?? '',
          price: listing?.price?.money?.amount ?? null,
          image: item.images?.primary?.large?.url ?? null,
        });
      }
      if (json?.errors) console.log('API errors:', JSON.stringify(json.errors).slice(0, 400));
      await new Promise((r) => setTimeout(r, 1100));
    }
    console.log(`API enriched ${enrich.size}/${asins.length} ASINs`);
  } catch (e) {
    console.warn('API enrich failed, upserting ASIN-only:', e.message);
  }
} else {
  console.log('Skipping API enrich (pass --with-api). Upserting ASIN rows only.');
}

const rows = KNOWN.map((k) => {
  const e = enrich.get(k.amazon_asin) || {};
  return {
    link_key: slugify(k.product_name),
    product_name: k.product_name,
    amazon_asin: k.amazon_asin,
    uk_price_gbp: e.price ?? null,
    image_url: e.image ?? null,
  };
});

for (const r of rows) {
  console.log(
    `${r.link_key} -> ${r.amazon_asin} price=${r.uk_price_gbp ?? '-'} img=${r.image_url ? 'yes' : 'no'}`
  );
}

if (!WRITE) {
  console.log('Dry run — pass without --dry to write');
  process.exit(0);
}

const out = await sb('gvt_affiliate_links?on_conflict=link_key', {
  method: 'POST',
  body: JSON.stringify(rows),
});
console.log(`Upserted ${Array.isArray(out) ? out.length : rows.length} known ASIN rows`);
