/**
 * Fill wooting-60he image_url from Amazon public product page og:image / hiRes.
 * No Creators API. Does not invent ASINs.
 *
 *   node --env-file=.env scripts/fix-wooting-image.mjs
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ASIN = 'B0DJY46XTF';
const LINK_KEY = 'wooting-60he';

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
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const page = await fetch(`https://www.amazon.co.uk/dp/${ASIN}`, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GearVersusTech/1.0; +https://gearversustech.com)',
    'Accept-Language': 'en-GB,en;q=0.9',
  },
  redirect: 'follow',
});
console.log('amazon_page', page.status);
const html = await page.text();

const patterns = [
  /property="og:image"\s+content="([^"]+)"/i,
  /content="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
  /"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
  /data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
];

let image = null;
for (const re of patterns) {
  const m = html.match(re);
  if (m?.[1]?.includes('media-amazon.com')) {
    image = m[1];
    break;
  }
}

if (!image) {
  // Fallback: use wooting-80he image already in DB (same family) if present
  const sib = await sb(
    `gvt_affiliate_links?select=image_url&link_key=eq.wooting-80he&limit=1`
  );
  image = sib?.[0]?.image_url || null;
  console.log('fallback_to_80he', !!image);
}

if (!image) {
  console.error('No image found');
  process.exit(1);
}

console.log('image', image.slice(0, 120));

const out = await sb(`gvt_affiliate_links?link_key=eq.${LINK_KEY}`, {
  method: 'PATCH',
  body: JSON.stringify({
    image_url: image,
    amazon_asin: ASIN,
    updated_at: new Date().toISOString(),
  }),
});
console.log('patched', Array.isArray(out) ? out.length : 1);
