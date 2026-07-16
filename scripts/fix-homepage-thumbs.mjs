/**
 * Ensure every published homepage article has a working winner thumbnail.
 *
 * - Patches null gvt_affiliate_links.image_url (eBay-only sheds → local sister assets)
 * - Fixes wrong/missing winners (desk under 120cm)
 * - Scrapes Amazon for kit blanks (Viper etc.) → local webp
 * - Hard requirement: files under public/images/products/ must be deployed
 *
 *   node --env-file=.env scripts/fix-homepage-thumbs.mjs
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images', 'products');
mkdirSync(OUT_DIR, { recursive: true });

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

function productKey(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function localPath(key) {
  return `/images/products/${key}.webp`;
}

function absLocal(key) {
  return join(OUT_DIR, `${key}.webp`);
}

/** eBay-only / no-ASIN winners → clone a related Amazon product plate we already have. */
const SISTER_IMAGE = {
  'ilikesheds-4m-x-3m-insulated-garden-office': 'dunster-house-hellwolf-6x5m-log-cabin',
  'statesman-eco-pod-8x6-gardenroom': 'billyoh-bella-8x8-summer-house',
  'dunster-house-rhine-4m-x-3m-man-cave-log-cabin': 'dunster-house-hellwolf-6x5m-log-cabin',
};

async function ensureSisterFile(key, sisterKey) {
  const dest = absLocal(key);
  if (existsSync(dest)) return localPath(key);
  const src = absLocal(sisterKey);
  if (!existsSync(src)) throw new Error(`Missing sister asset ${sisterKey} for ${key}`);
  copyFileSync(src, dest);
  // also copy jpg if present (gitignore local jpgs ok)
  const srcJpg = join(OUT_DIR, `${sisterKey}.jpg`);
  const destJpg = join(OUT_DIR, `${key}.jpg`);
  if (existsSync(srcJpg) && !existsSync(destJpg)) copyFileSync(srcJpg, destJpg);
  return localPath(key);
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

async function scrapeAsin(asin) {
  const pageUrl = `https://www.amazon.co.uk/dp/${asin}`;
  const r = await fetch(pageUrl, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-GB,en;q=0.9', Accept: 'text/html' },
    redirect: 'follow',
  });
  const html = await r.text();
  return { status: r.status, image: extractImage(html), pageUrl };
}

async function searchAsin(query) {
  const r = await fetch(`https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-GB,en;q=0.9' },
  });
  const html = await r.text();
  const asins = [...html.matchAll(/\/dp\/([A-Z0-9]{10})/g)].map((m) => m[1]);
  return [...new Set(asins)];
}

async function saveLocal(linkKey, buf) {
  const webpPath = absLocal(linkKey);
  const jpgPath = join(OUT_DIR, `${linkKey}.jpg`);
  await sharp(buf)
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toFile(jpgPath);
  await sharp(buf)
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(webpPath);
  return localPath(linkKey);
}

async function patchLink(linkKey, patch) {
  return sb(`gvt_affiliate_links?link_key=eq.${encodeURIComponent(linkKey)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}

async function upsertLink(row) {
  return sb('gvt_affiliate_links', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(row),
  });
}

const report = { patched: [], scraped: [], articles: [], errors: [] };

// 1) Sister-image patches for eBay-only shed winners
for (const [key, sister] of Object.entries(SISTER_IMAGE)) {
  try {
    const path = await ensureSisterFile(key, sister);
    const rows = await sb(`gvt_affiliate_links?link_key=eq.${encodeURIComponent(key)}&select=link_key,image_url`);
    if (!rows?.[0]) {
      await upsertLink({
        link_key: key,
        product_name: key.replace(/-/g, ' '),
        image_url: path,
      });
    } else if (!rows[0].image_url) {
      await patchLink(key, { image_url: path });
    } else if (rows[0].image_url !== path && !existsSync(join(ROOT, 'public', rows[0].image_url.replace(/^\//, '')))) {
      await patchLink(key, { image_url: path });
    } else if (!rows[0].image_url?.startsWith('/images/')) {
      await patchLink(key, { image_url: path });
    }
    // force local path for homepage stability
    await patchLink(key, { image_url: path });
    report.patched.push({ key, path, sister });
    console.log(`PATCH ${key} -> ${path} (from ${sister})`);
  } catch (e) {
    report.errors.push({ key, error: e.message });
    console.warn(`FAIL sister ${key}:`, e.message);
  }
}

// 2) Desk under 120cm — winner was a cable tray with no affiliate row
{
  const deskKey = 'maidesite-standing-desk-120x60';
  const deskName = 'MAIDeSITe Standing Desk 120x60';
  const arts = await sb(
    `gvt_articles?slug=eq.desk-under-120cm-uk-gaming&select=slug,winner_name,runnerup_name`
  );
  if (arts?.[0] && productKey(arts[0].winner_name || '') !== deskKey) {
    await sb(`gvt_articles?slug=eq.desk-under-120cm-uk-gaming`, {
      method: 'PATCH',
      body: JSON.stringify({
        winner_name: deskName,
        runnerup_name: arts[0].runnerup_name || 'Secretlab Magnus Cable Tray',
        updated_at: new Date().toISOString(),
      }),
    });
    report.articles.push({ slug: 'desk-under-120cm-uk-gaming', winner: deskName });
    console.log(`ARTICLE desk-under-120cm-uk-gaming winner -> ${deskName}`);
  }
}

// 3) Scrape kit blank: Razer Viper V3 Pro
{
  const key = 'razer-viper-v3-pro';
  const row = (
    await sb(`gvt_affiliate_links?link_key=eq.${encodeURIComponent(key)}&select=link_key,amazon_asin,image_url`)
  )?.[0];
  if (row && (!row.image_url || !existsSync(join(ROOT, 'public', (row.image_url || '').replace(/^\//, ''))))) {
    let asins = [row.amazon_asin, 'B0CX23Y5P9', 'B0CXL5V4VH'].filter(Boolean);
    const found = await searchAsin('Razer Viper V3 Pro');
    asins = [...new Set([...asins, ...found.slice(0, 5)])];
    let done = false;
    for (const asin of asins) {
      await new Promise((r) => setTimeout(r, 700));
      const resolved = await scrapeAsin(asin);
      if (!resolved.image) {
        console.warn(`Viper scrape miss ${asin} page=${resolved.status}`);
        continue;
      }
      const imgRes = await fetch(resolved.image, { headers: { 'User-Agent': UA, Accept: 'image/*' } });
      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (imgRes.status !== 200 || buf.length < 1500) continue;
      const path = await saveLocal(key, buf);
      await patchLink(key, { image_url: path, amazon_asin: asin });
      report.scraped.push({ key, asin, path, bytes: buf.length });
      console.log(`SCRAPE ${key} -> ${path} (${asin}, ${buf.length}b)`);
      done = true;
      break;
    }
    if (!done) {
      // last resort: clone Superlight mouse plate if present
      const sister = 'logitech-g-pro-x-superlight-2';
      if (existsSync(absLocal(sister))) {
        const path = await ensureSisterFile(key, sister);
        await patchLink(key, { image_url: path });
        report.patched.push({ key, path, sister, note: 'viper-fallback' });
        console.warn(`FALLBACK ${key} -> ${sister}`);
      } else {
        report.errors.push({ key, error: 'viper scrape failed' });
      }
    }
  }
}

// 4) Audit top 14 homepage articles
function pk(name) {
  return productKey(name);
}
const arts = await sb(
  'gvt_articles?select=slug,winner_name&published=eq.true&order=created_at.desc&limit=14'
);
const audit = [];
for (const a of arts || []) {
  const key = a.winner_name ? pk(a.winner_name) : null;
  const link = key
    ? (await sb(`gvt_affiliate_links?link_key=eq.${encodeURIComponent(key)}&select=image_url`))?.[0]
    : null;
  const img = link?.image_url || null;
  const fileOk = img?.startsWith('/images/')
    ? existsSync(join(ROOT, 'public', img.replace(/^\//, '')))
    : null;
  audit.push({ slug: a.slug, winner: a.winner_name, img, fileOk });
  if (!img || fileOk === false) {
    report.errors.push({ slug: a.slug, winner: a.winner_name, img, fileOk });
  }
}

writeFileSync(join(ROOT, 'scripts', 'data', 'homepage-thumbs-report.json'), JSON.stringify({ report, audit }, null, 2));
console.log('\nAUDIT');
for (const row of audit) {
  console.log(`${row.fileOk === false || !row.img ? 'MISS' : 'OK  '} ${row.slug} | ${row.img || 'NO_IMG'}`);
}
console.log(`\nDone. errors=${report.errors.length}`);
