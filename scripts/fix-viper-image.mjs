const sbUrl = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ASIN = 'B0CXL5V4VH';

const page = await fetch(`https://www.amazon.co.uk/dp/${ASIN}`, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GearVersusTech/1.0; +https://gearversustech.com)',
    'Accept-Language': 'en-GB',
  },
});
const html = await page.text();
const patterns = [
  /property="og:image"\s+content="([^"]+)"/i,
  /"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
  /data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
];
let image = null;
for (const re of patterns) {
  const m = html.match(re);
  if (m?.[1]) {
    image = m[1];
    break;
  }
}
console.log('page', page.status, 'image', image ? image.slice(0, 120) : null);
if (!image) process.exit(1);

const r = await fetch(
  `${sbUrl}/rest/v1/gvt_affiliate_links?link_key=eq.razer-viper-v3-pro`,
  {
    method: 'PATCH',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      image_url: image,
      amazon_asin: ASIN,
      updated_at: new Date().toISOString(),
    }),
  }
);
console.log('patch', r.status);
