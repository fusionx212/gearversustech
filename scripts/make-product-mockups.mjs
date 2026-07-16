/**
 * Build in-room mockups from REAL Amazon product photos (exact ASIN image_url).
 * Pipeline: download → near-white cutout (sharp) → composite onto room scene.
 * Prefers GIMP/rembg if present; falls back to sharp white-key cutout for Amazon studio shots.
 *
 *   node --env-file=.env scripts/make-product-mockups.mjs
 *   node --env-file=.env scripts/make-product-mockups.mjs --only=wooting-60he,keychron-k2-he
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images', 'mockups');
const PRODUCT_DIR = join(ROOT, 'public', 'images', 'products');
const ROOM_DIR = join(ROOT, 'public', 'images', 'rooms');
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(PRODUCT_DIR, { recursive: true });
mkdirSync(ROOM_DIR, { recursive: true });

const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const ONLY = onlyArg
  ? new Set(onlyArg.slice(7).split(',').map((s) => s.trim()).filter(Boolean))
  : null;

const enrichment = JSON.parse(
  readFileSync(join(__dirname, 'data', 'product-enrichment.json'), 'utf8')
);

async function sb(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

function hasCmd(cmd) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], {
    encoding: 'utf8',
  });
  return r.status === 0;
}

async function ensureRoom(kind) {
  const file = join(ROOM_DIR, `${kind}.jpg`);
  if (existsSync(file)) return file;

  const W = 1600;
  const H = 1000;
  let svg;
  if (kind === 'garage') {
    svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a3f46"/><stop offset="55%" stop-color="#2a2e34"/><stop offset="55%" stop-color="#4a4036"/><stop offset="100%" stop-color="#2f2922"/>
        </linearGradient>
        <pattern id="brick" width="80" height="40" patternUnits="userSpaceOnUse">
          <rect width="80" height="40" fill="#4a4540"/>
          <rect x="2" y="2" width="36" height="16" fill="#6b5e52"/>
          <rect x="42" y="2" width="36" height="16" fill="#5c5146"/>
          <rect x="22" y="22" width="36" height="16" fill="#635649"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#w)"/>
      <rect y="0" height="55%" width="100%" fill="url(#brick)" opacity="0.55"/>
      <rect y="55%" height="45%" width="100%" fill="#2a2620"/>
      <g opacity="0.25" stroke="#1a1814" stroke-width="2">
        ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${550 + i * 36}" x2="${W}" y2="${550 + i * 36}"/>`).join('')}
      </g>
      <ellipse cx="800" cy="200" rx="420" ry="90" fill="#e5a318" opacity="0.12"/>
    </svg>`;
  } else if (kind === 'smart') {
    svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e8e4dc"/><stop offset="100%" stop-color="#d5d0c6"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#wall)"/>
      <rect y="72%" width="100%" height="28%" fill="#8b7355"/>
      <rect x="180" y="220" width="520" height="320" rx="8" fill="#1a1d22" stroke="#333" stroke-width="8"/>
      <rect x="200" y="240" width="480" height="280" fill="#0d1117"/>
      <circle cx="1200" cy="420" r="90" fill="#f4f1ea" stroke="#ccc" stroke-width="4"/>
      <rect x="1160" y="510" width="80" height="120" fill="#c4b8a8"/>
    </svg>`;
  } else if (kind === 'cave') {
    svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1520"/>
      <rect y="70%" width="100%" height="30%" fill="#2a2430"/>
      <rect x="200" y="160" width="900" height="420" rx="6" fill="#0a0a0c" stroke="#444" stroke-width="10"/>
      <rect x="230" y="190" width="840" height="360" fill="#111"/>
      <ellipse cx="650" cy="370" rx="300" ry="120" fill="#e5a318" opacity="0.08"/>
    </svg>`;
  } else {
    // desk / gaming room
    svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a3038"/><stop offset="100%" stop-color="#1c222a"/>
        </linearGradient>
        <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6b4f32"/><stop offset="100%" stop-color="#4a3420"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#wall)"/>
      <rect x="120" y="140" width="900" height="420" rx="10" fill="#12151a" stroke="#3a414c" stroke-width="12"/>
      <rect x="150" y="170" width="840" height="360" fill="#0b0e12"/>
      <rect y="62%" width="100%" height="38%" fill="url(#desk)"/>
      <rect y="62%" width="100%" height="18" fill="#7a5a38" opacity="0.7"/>
      <ellipse cx="980" cy="520" rx="220" ry="40" fill="#000" opacity="0.35"/>
      <rect x="1050" y="300" width="28" height="320" fill="#3a414c"/>
      <circle cx="1064" cy="280" r="36" fill="#e5a318" opacity="0.35"/>
    </svg>`;
  }
  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(file);
  return file;
}

/** Make near-white / light studio background transparent. Good for Amazon packshots. */
async function cutoutWhiteBg(inputBuf) {
  const { data, info } = await sharp(inputBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = info.width * info.height;
  for (let i = 0; i < px; i++) {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    // Near-white / light gray studio backdrop
    if (r > 235 && g > 235 && b > 235) {
      data[o + 3] = 0;
    } else if (r > 220 && g > 220 && b > 220 && sat < 0.08) {
      data[o + 3] = Math.min(data[o + 3], 40);
    } else if (r > 200 && g > 200 && b > 200 && sat < 0.05) {
      data[o + 3] = Math.min(data[o + 3], 120);
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function tryRembg(inputPath, outputPath) {
  if (!hasCmd('rembg')) return false;
  const r = spawnSync('rembg', ['i', inputPath, outputPath], { encoding: 'utf8' });
  return r.status === 0 && existsSync(outputPath);
}

async function download(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GearVersusTech/1.0; +https://gearversustech.com)',
      Accept: 'image/*,*/*',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const keys = Object.keys(enrichment).filter((k) => !ONLY || ONLY.has(k));
const rows = await sb(
  `gvt_affiliate_links?select=link_key,product_name,amazon_asin,image_url&link_key=in.(${keys.join(',')})`
);
const byKey = new Map(rows.map((r) => [r.link_key, r]));

let made = 0;
for (const key of keys) {
  const row = byKey.get(key);
  const meta = enrichment[key];
  if (!row?.image_url) {
    console.warn(`SKIP ${key}: no image_url in DB`);
    continue;
  }
  const roomKind = meta.room || 'desk';
  const roomPath = await ensureRoom(roomKind === 'gym' ? 'garage' : roomKind);
  const productPath = join(PRODUCT_DIR, `${key}.jpg`);
  const cutPath = join(PRODUCT_DIR, `${key}-cut.png`);
  const outPath = join(OUT_DIR, `${key}.webp`);

  console.log(`MOCKUP ${key} ← ${row.amazon_asin || 'no-asin'} room=${roomKind}`);
  const imgBuf = await download(row.image_url);
  await sharp(imgBuf).jpeg({ quality: 92 }).toFile(productPath);

  let cutBuf;
  if (await tryRembg(productPath, cutPath)) {
    cutBuf = readFileSync(cutPath);
    console.log('  cutout: rembg');
  } else {
    cutBuf = await cutoutWhiteBg(imgBuf);
    writeFileSync(cutPath, cutBuf);
    console.log('  cutout: sharp white-key');
  }

  const roomMeta = await sharp(roomPath).metadata();
  const RW = roomMeta.width || 1600;
  const RH = roomMeta.height || 1000;

  // Place product on desk surface / scene — size by category
  const targetH =
    roomKind === 'smart' ? Math.round(RH * 0.28) : Math.round(RH * 0.42);
  const productResized = await sharp(cutBuf)
    .resize({ height: targetH, fit: 'inside' })
    .png()
    .toBuffer();
  const pMeta = await sharp(productResized).metadata();
  const pw = pMeta.width || 400;
  const ph = pMeta.height || 400;

  let left = Math.round(RW * 0.55 - pw / 2);
  let top = Math.round(RH * 0.58 - ph * 0.75);
  if (roomKind === 'smart') {
    left = Math.round(RW * 0.62);
    top = Math.round(RH * 0.48);
  } else if (roomKind === 'garage') {
    left = Math.round(RW * 0.5 - pw / 2);
    top = Math.round(RH * 0.5);
  } else if (roomKind === 'cave') {
    left = Math.round(RW * 0.55);
    top = Math.round(RH * 0.45);
  }

  left = Math.max(20, Math.min(left, RW - pw - 20));
  top = Math.max(20, Math.min(top, RH - ph - 20));

  await sharp(roomPath)
    .composite([{ input: productResized, left, top }])
    .webp({ quality: 82 })
    .toFile(outPath);

  // Also keep a clean product webp for cards
  await sharp(cutBuf)
    .resize({ width: 800, height: 800, fit: 'inside' })
    .webp({ quality: 85 })
    .toFile(join(PRODUCT_DIR, `${key}.webp`));

  made++;
}

console.log(`Made ${made}/${keys.length} mockups → public/images/mockups/`);
