/**
 * Force re-download Amazon hi-res for Gaming Room kit packshots that are
 * undersized / over-compressed, then square-pad onto dark GVT stage.
 *
 *   node --env-file=.env scripts/refetch-gaming-kit-photos.mjs
 */
import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'images', 'products');
mkdirSync(OUT_DIR, { recursive: true });

const MIN_BYTES = 28000;
const STAGE = { r: 14, g: 16, b: 20, alpha: 1 };
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

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

function extractImage(html) {
  const patterns = [
    /"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /property="og:image"\s+content="(https:\/\/[^"]+)"/i,
    /name="twitter:image"\s+content="(https:\/\/[^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].replace(/\\u002F/g, '/');
  }
  return null;
}

async function resolveFromAsin(asin) {
  const pageUrl = `https://www.amazon.co.uk/dp/${asin}`;
  const r = await fetch(pageUrl, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'en-GB,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  return { status: r.status, image: extractImage(await r.text()), pageUrl };
}

async function fetchBuf(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    redirect: 'follow',
  });
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, size: buf.length, buf };
}

async function saveCatalogue(linkKey, buf) {
  const SIZE = 900;
  const fitted = await sharp(buf)
    .resize({ width: SIZE - 80, height: SIZE - 80, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();
  const meta = await sharp(fitted).metadata();
  const left = Math.round((SIZE - (meta.width || SIZE)) / 2);
  const top = Math.round((SIZE - (meta.height || SIZE)) / 2);
  const square = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: STAGE },
  })
    .composite([{ input: fitted, left, top }])
    .png()
    .toBuffer();

  const webpPath = join(OUT_DIR, `${linkKey}.webp`);
  const jpgPath = join(OUT_DIR, `${linkKey}.jpg`);
  await sharp(square).jpeg({ quality: 90 }).toFile(jpgPath);
  await sharp(square).webp({ quality: 88 }).toFile(webpPath);
  return `/images/products/${linkKey}.webp`;
}

const items = await sb(
  'gvt_kit_items?kit_slug=eq.gaming-room-build-kit&select=link_key,product_name'
);
const keys = [...new Set(items.map((i) => i.link_key).filter(Boolean))];
const links = await sb(
  `gvt_affiliate_links?link_key=in.(${keys.map(encodeURIComponent).join(',')})&select=link_key,product_name,amazon_asin,image_url`
);

const report = [];
let fixed = 0;
let skipped = 0;
let failed = 0;

for (const row of links) {
  const local = join(OUT_DIR, `${row.link_key}.webp`);
  const size = existsSync(local) ? statSync(local).size : 0;
  const needs = size < MIN_BYTES || !existsSync(local);
  if (!needs) {
    console.log(`OK keep ${row.link_key} (${size}b)`);
    skipped++;
    report.push({ key: row.link_key, ok: true, kept: true, bytes: size });
    continue;
  }
  if (!row.amazon_asin) {
    console.warn(`FAIL ${row.link_key}: no ASIN`);
    failed++;
    report.push({ key: row.link_key, ok: false, reason: 'no-asin' });
    continue;
  }

  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
  let resolved;
  try {
    resolved = await resolveFromAsin(row.amazon_asin);
  } catch (e) {
    console.warn(`FAIL ${row.link_key}: ${e.message}`);
    failed++;
    report.push({ key: row.link_key, ok: false, reason: 'scrape' });
    continue;
  }
  if (!resolved.image) {
    console.warn(`FAIL ${row.link_key}: no hiRes (page ${resolved.status})`);
    failed++;
    report.push({ key: row.link_key, ok: false, reason: 'no-hires', page: resolved.status });
    continue;
  }
  const media = await fetchBuf(resolved.image);
  if (media.status !== 200 || media.size < 2000) {
    console.warn(`FAIL ${row.link_key}: media ${media.status}/${media.size}`);
    failed++;
    report.push({ key: row.link_key, ok: false, reason: 'bad-media' });
    continue;
  }

  const path = await saveCatalogue(row.link_key, media.buf);
  await sb(`gvt_affiliate_links?link_key=eq.${encodeURIComponent(row.link_key)}`, {
    method: 'PATCH',
    body: JSON.stringify({ image_url: path, updated_at: new Date().toISOString() }),
  });
  const outSize = statSync(join(OUT_DIR, `${row.link_key}.webp`)).size;
  console.log(`FIXED ${row.link_key} ${size}b -> ${outSize}b`);
  fixed++;
  report.push({ key: row.link_key, ok: true, path, from: size, bytes: outSize });
}

writeFileSync(join(ROOT, 'scripts', 'data', 'gaming-kit-photo-refetch.json'), JSON.stringify(report, null, 2));
console.log(`Done fixed=${fixed} kept=${skipped} failed=${failed}`);
