/**
 * Populate gvt_affiliate_links from the Amazon Creators API.
 *
 * Every product named as a winner/runner-up in gvt_articles is looked up via
 * SearchItems, and its ASIN, price and Amazon-hosted image are stored. The API
 * title is stored alongside so a bad keyword match is visible rather than silent.
 *
 * Creators API v3.2 (LwA, EU): JSON token body, scope creatorsapi::default.
 *
 *   node sync-amazon-products.mjs            # report only, writes nothing
 *   node sync-amazon-products.mjs --write    # upsert into Supabase
 */

const AMZ_ID = process.env.AMZ_ID;
const AMZ_SECRET = process.env.AMZ_SECRET;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PARTNER_TAG = 'gearversustech-21';
const MARKETPLACE = 'www.amazon.co.uk';

const WRITE = process.argv.includes('--write');

// Verdict strings that are not purchasable products.
const NOT_A_PRODUCT = /depends|caveat|it depends/i;

const slugify = (s) =>
  s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function getToken() {
  const res = await fetch('https://api.amazon.co.uk/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: AMZ_ID,
      client_secret: AMZ_SECRET,
      scope: 'creatorsapi::default',
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

// Brands that sell direct-to-consumer only. Amazon listings under these names are
// third-party lookalikes, never the real product.
const DIRECT_TO_CONSUMER = ['secretlab', 'wooting', 'homey'];

/**
 * A keyword search will always return *something*. Accept a hit only if Amazon's
 * own title carries the brand and every distinctive model token from the product
 * name — otherwise a "Secretlab Titan Evo" search happily resolves to a Symino chair.
 */
// Amazon lists some makers under a sub-brand rather than the parent company.
const BRAND_ALIASES = { 'tp-link': ['tp-link', 'tapo'], 'home': ['home assistant', 'nabu casa'] };

const STOPWORDS = new Set(['the', 'and', 'with', 'for', 'pro', 'plus', 'edition', 'gen']);

function isConfident(productName, amazonTitle) {
  const title = amazonTitle.toLowerCase();
  const norm = (s) => s.replace(/[^a-z0-9]/g, '');
  const lower = productName.toLowerCase();

  const brand = lower.split(/\s+/)[0];
  const accepted = BRAND_ALIASES[brand] ?? [brand];
  if (!accepted.some((b) => title.includes(b))) return false;

  // Model tokens (P110, AW2725DF, 27GR95QE, 60HE) must appear verbatim when present.
  const modelTokens = lower.match(/\b(?=[a-z0-9]*\d)(?=[a-z0-9]*[a-z])[a-z0-9]{3,}\b/g) ?? [];
  if (modelTokens.length) {
    return modelTokens.every((t) => norm(title).includes(norm(t)));
  }

  // No model number to anchor on (e.g. "SmartThings Station") — demand every
  // distinctive word instead, so it can't drift to a different item in the range.
  const words = lower.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return words.every((w) => title.includes(w));
}

async function searchItem(token, keywords) {
  const res = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}, Version 3.2`,
      'x-marketplace': MARKETPLACE,
    },
    body: JSON.stringify({
      keywords,
      marketplace: MARKETPLACE,
      partnerTag: PARTNER_TAG,
      itemCount: 5,
      resources: ['itemInfo.title', 'images.primary.large', 'offersV2.listings.price'],
    }),
  });
  const json = await res.json();
  const items = json?.searchResult?.items ?? [];
  if (!items.length) return null;

  // Prefer a buyable single unit over multipacks, which skew the price comparison.
  const candidates = items.filter(
    (i) => !/\b\d-pack\b|\bpack of\b/i.test(i.itemInfo?.title?.displayValue ?? '')
  );
  const item = (candidates.length ? candidates : items).find((i) =>
    isConfident(keywords, i.itemInfo?.title?.displayValue ?? '')
  );
  if (!item) return { rejected: items[0].itemInfo?.title?.displayValue ?? '(untitled)' };

  const listing = item.offersV2?.listings?.[0];
  return {
    asin: item.asin,
    title: item.itemInfo?.title?.displayValue ?? '',
    price: listing?.price?.money?.amount ?? null,
    image: item.images?.primary?.large?.url ?? null,
    detailPageURL: item.detailPageURL ?? null,
  };
}

async function sb(path, init = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const articles = await sb('gvt_articles?select=winner_name,runnerup_name&published=eq.true');

const products = [...new Set(
  articles.flatMap((a) => [a.winner_name, a.runnerup_name])
    .filter((n) => n && !NOT_A_PRODUCT.test(n))
)].sort();

console.log(`${products.length} products to resolve (${WRITE ? 'WRITE' : 'DRY RUN'})\n`);

const token = await getToken();
const rows = [];
let missed = 0;

for (const name of products) {
  if (DIRECT_TO_CONSUMER.some((b) => name.toLowerCase().startsWith(b))) {
    console.log(`  D2C   ${name}  — not sold on Amazon; needs Awin/eBay`);
    missed++;
    continue;
  }
  const hit = await searchItem(token, name);
  if (!hit) {
    console.log(`  MISS  ${name}  — no results`);
    missed++;
    continue;
  }
  if (hit.rejected) {
    console.log(`  REJECT ${name}\n          top hit was: ${hit.rejected.slice(0, 65)}`);
    missed++;
    await new Promise((r) => setTimeout(r, 1100));
    continue;
  }
  rows.push({
    link_key: slugify(name),
    product_name: name,
    amazon_asin: hit.asin,
    uk_price_gbp: hit.price,
    image_url: hit.image,
  });
  const price = hit.price != null ? `£${hit.price}` : 'no price';
  console.log(`  OK    ${name}\n          -> ${hit.asin}  ${price}\n          -> ${hit.title.slice(0, 70)}`);
  await new Promise((r) => setTimeout(r, 1100)); // stay under the rate limit
}

console.log(`\n${rows.length} resolved, ${missed} missed`);

if (!WRITE) {
  console.log('\nDry run — nothing written. Re-run with --write to upsert.');
} else {
  await sb('gvt_affiliate_links?on_conflict=link_key', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  console.log(`Upserted ${rows.length} rows into gvt_affiliate_links.`);
}
