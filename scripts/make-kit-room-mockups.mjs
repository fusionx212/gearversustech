/**
 * Full kit-in-room mockups: composite REAL product cutouts into one scene.
 *
 *   node --env-file=.env scripts/make-kit-room-mockups.mjs
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const KITS_DIR = join(ROOT, 'public', 'images', 'kits');
const PRODUCT_DIR = join(ROOT, 'public', 'images', 'products');
const ROOM_DIR = join(ROOT, 'public', 'images', 'rooms');
mkdirSync(KITS_DIR, { recursive: true });

const catalog = JSON.parse(
  readFileSync(join(__dirname, 'data', 'kits-catalog.json'), 'utf8')
);

async function ensureDeskRoom() {
  const file = join(ROOM_DIR, 'desk.jpg');
  if (existsSync(file)) return file;
  mkdirSync(ROOM_DIR, { recursive: true });
  const W = 1800;
  const H = 1100;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2c3340"/><stop offset="100%" stop-color="#1a1f28"/>
      </linearGradient>
      <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a5634"/><stop offset="100%" stop-color="#4e351f"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#wall)"/>
    <rect x="220" y="120" width="980" height="480" rx="12" fill="#10141a" stroke="#3d4654" stroke-width="14"/>
    <rect x="250" y="150" width="920" height="420" fill="#070a0e"/>
    <rect y="64%" width="100%" height="36%" fill="url(#desk)"/>
    <rect y="64%" width="100%" height="20" fill="#8a643e" opacity="0.75"/>
    <rect x="1380" y="280" width="30" height="360" fill="#3d4654"/>
    <circle cx="1395" cy="250" r="40" fill="#e5a318" opacity="0.4"/>
    <ellipse cx="900" cy="720" rx="500" ry="50" fill="#000" opacity="0.28"/>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(file);
  return file;
}

async function ensureGarageRoom() {
  const file = join(ROOM_DIR, 'garage.jpg');
  if (existsSync(file)) return file;
  const W = 1800;
  const H = 1100;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="brick" width="90" height="45" patternUnits="userSpaceOnUse">
        <rect width="90" height="45" fill="#4a4540"/>
        <rect x="3" y="3" width="40" height="18" fill="#6b5e52"/>
        <rect x="48" y="3" width="40" height="18" fill="#5c5146"/>
        <rect x="24" y="24" width="40" height="18" fill="#635649"/>
      </pattern>
    </defs>
    <rect width="100%" height="58%" fill="url(#brick)"/>
    <rect y="58%" width="100%" height="42%" fill="#2a2620"/>
    <g opacity="0.2" stroke="#111" stroke-width="2">
      ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${640 + i * 32}" x2="1800" y2="${640 + i * 32}"/>`).join('')}
    </g>
    <rect x="200" y="180" width="500" height="420" fill="none" stroke="#888" stroke-width="8" opacity="0.35"/>
    <text x="450" y="400" fill="#aaa" font-size="36" text-anchor="middle" font-family="sans-serif" opacity="0.5">RACK ZONE</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(file);
  return file;
}

async function loadCut(linkKey, maxH) {
  const cut = join(PRODUCT_DIR, `${linkKey}-cut.png`);
  const webp = join(PRODUCT_DIR, `${linkKey}.webp`);
  const jpg = join(PRODUCT_DIR, `${linkKey}.jpg`);
  const src = existsSync(cut) ? cut : existsSync(webp) ? webp : existsSync(jpg) ? jpg : null;
  if (!src) return null;
  const buf = await sharp(src)
    .resize({ height: maxH, fit: 'inside' })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width || 100, h: meta.height || 100 };
}

async function composeGaming() {
  const room = await ensureDeskRoom();
  const placements = [
    { key: 'alienware-aw2725df', h: 380, left: 280, top: 140 },
    { key: 'wooting-80he', h: 140, left: 520, top: 620 },
    { key: 'logitech-g-pro-x-superlight-2', h: 90, left: 980, top: 680 },
    { key: 'hyperx-cloud-iii-wireless', h: 200, left: 1280, top: 480 },
    { key: 'govee-g1', h: 120, left: 200, top: 500 },
    { key: 'tp-link-tapo-p110', h: 100, left: 1500, top: 700 },
  ];

  const composites = [];
  for (const p of placements) {
    const cut = await loadCut(p.key, p.h);
    if (!cut) {
      console.warn('missing cutout', p.key);
      continue;
    }
    composites.push({ input: cut.buf, left: p.left, top: p.top });
  }

  const out = join(KITS_DIR, 'gaming-room-build-kit.webp');
  // Label strip
  const label = Buffer.from(`<svg width="1800" height="1100" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="40" width="520" height="88" rx="10" fill="rgba(12,14,18,0.82)"/>
    <text x="64" y="78" fill="#e5a318" font-size="22" font-family="Space Grotesk, sans-serif" font-weight="700">GAMING ROOM BUILD KIT</text>
    <text x="64" y="108" fill="#d7dde6" font-size="16" font-family="Source Sans 3, sans-serif">Real product photos · staged UK desk</text>
  </svg>`);

  await sharp(room)
    .resize(1800, 1100)
    .composite([...composites, { input: await sharp(label).png().toBuffer(), left: 0, top: 0 }])
    .webp({ quality: 84 })
    .toFile(out);
  console.log('Wrote', out, 'layers', composites.length);
}

async function composeGarage() {
  const room = await ensureGarageRoom();
  // Gym products lack cutouts — branded informative hero with tier callouts
  const overlay = Buffer.from(`<svg width="1800" height="1100" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="1800" height="1100" fill="rgba(0,0,0,0.25)"/>
    <rect x="80" y="80" width="640" height="220" rx="14" fill="rgba(12,14,18,0.88)"/>
    <text x="110" y="140" fill="#e5a318" font-size="28" font-family="sans-serif" font-weight="700">UK GARAGE GYM BUILD KIT</text>
    <text x="110" y="180" fill="#d7dde6" font-size="18" font-family="sans-serif">≤£500 · ≤£1,000 · ≤£2,500 tiers</text>
    <text x="110" y="220" fill="#9aa3ad" font-size="16" font-family="sans-serif">Ceiling · flooring noise · Mirafit/Rogue · adjustables</text>
    <text x="110" y="255" fill="#9aa3ad" font-size="15" font-family="sans-serif">Product cutouts pending verified ASINs (Amazon sync blocked)</text>
    <rect x="80" y="720" width="500" height="140" rx="12" fill="rgba(12,14,18,0.85)"/>
    <text x="110" y="770" fill="#fff" font-size="18" font-family="sans-serif">Bare bones: adjustables + 20mm rubber</text>
    <text x="110" y="805" fill="#fff" font-size="18" font-family="sans-serif">Working: half rack / fold-away + bench</text>
    <text x="110" y="840" fill="#fff" font-size="18" font-family="sans-serif">Full bay: rack + plates + power plan</text>
  </svg>`);
  const out = join(KITS_DIR, 'uk-garage-gym-build-kit.webp');
  await sharp(room)
    .resize(1800, 1100)
    .composite([{ input: await sharp(overlay).png().toBuffer(), left: 0, top: 0 }])
    .webp({ quality: 84 })
    .toFile(out);
  console.log('Wrote', out, '(gym cutouts pending ASINs)');
}

await composeGaming();
await composeGarage();
console.log('Kit room mockups done');
