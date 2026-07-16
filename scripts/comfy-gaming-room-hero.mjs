/**
 * Generate Spacely/Twinkly-calibre full gaming ROOM hero via ComfyUI Juggernaut XL.
 * Replaces public/images/kits/gaming-room-build-kit.webp (+ .png).
 *
 *   node scripts/comfy-gaming-room-hero.mjs
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const COMFY = process.env.COMFY_URL || 'http://127.0.0.1:8188';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'images', 'kits');
const TMP = join(ROOT, 'tmp', 'comfy-gaming-room');
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const POSITIVE = `photorealistic cinematic wide shot of a finished modern UK gaming room, full room context with walls ceiling floor visible, large clean standing desk with PC tower monitor mechanical keyboard mouse headset on desk, ergonomic gaming chair, warm amber and soft cool bias lighting behind monitor, subtle RGB under desk glow amber not purple neon chaos, dark graphite walls, soft rug, cable-managed, shallow depth of field magazine photography, Spacely AI room design quality, Twinkly editorial lifestyle photo, ultra detailed, 8k, natural materials, lived-in premium setup, no text, no watermark, no floating product collage, no schematic, no SVG, no cutout stickers`;

const NEGATIVE = `collage, product grid, floating products, schematic, blueprint, cartoon, anime, illustration, lowres, blurry, deformed, text, watermark, logo, purple neon overload, cyberpunk clutter, empty white void, cutout stickers, amazon product photo, white background, multiple panels, split screen, UI overlay, bad anatomy`;

function workflow(seed) {
  // SDXL Juggernaut XL simple txt2img → 1344x768 then we resize to 1800x1050
  return {
    3: {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps: 28,
        cfg: 5.5,
        sampler_name: 'dpmpp_2m',
        scheduler: 'karras',
        denoise: 1,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0],
      },
    },
    4: {
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: 'juggernaut_xl_v10.safetensors' },
    },
    5: {
      class_type: 'EmptyLatentImage',
      inputs: { width: 1344, height: 768, batch_size: 1 },
    },
    6: {
      class_type: 'CLIPTextEncode',
      inputs: { text: POSITIVE, clip: ['4', 1] },
    },
    7: {
      class_type: 'CLIPTextEncode',
      inputs: { text: NEGATIVE, clip: ['4', 1] },
    },
    8: {
      class_type: 'VAEDecode',
      inputs: { samples: ['3', 0], vae: ['4', 2] },
    },
    9: {
      class_type: 'SaveImage',
      inputs: { filename_prefix: 'gvt_gaming_room_hero', images: ['8', 0] },
    },
  };
}

async function queuePrompt(prompt) {
  const r = await fetch(`${COMFY}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`queue ${r.status} ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

async function waitHistory(promptId, timeoutMs = 300000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 2000));
    const r = await fetch(`${COMFY}/history/${promptId}`);
    const j = await r.json();
    if (j[promptId]?.outputs) return j[promptId];
  }
  throw new Error('timeout waiting for ComfyUI');
}

async function downloadOutput(filename, subfolder = '', type = 'output') {
  const qs = new URLSearchParams({ filename, subfolder, type });
  const r = await fetch(`${COMFY}/view?${qs}`);
  if (!r.ok) throw new Error(`view ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

function findComfyOutputRoot() {
  const candidates = [
    process.env.COMFY_OUTPUT,
    'C:\\Users\\dalec\\ComfyUI\\output',
    'C:\\ComfyUI\\output',
    'D:\\ComfyUI\\output',
    'C:\\Users\\dalec\\AppData\\Local\\Programs\\ComfyUI\\output',
  ].filter(Boolean);
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

const seeds = [
  42424201 + Math.floor(Date.now() % 1000),
  77700123,
  31415926,
];

console.log('ComfyUI', COMFY);
const health = await fetch(`${COMFY}/system_stats`);
if (!health.ok) throw new Error('ComfyUI not reachable');

const candidates = [];
for (const seed of seeds) {
  console.log('queue seed', seed);
  const { prompt_id } = await queuePrompt(workflow(seed));
  console.log('prompt_id', prompt_id);
  const hist = await waitHistory(prompt_id);
  const images = hist.outputs?.['9']?.images || [];
  if (!images.length) {
    console.warn('no images for', seed, JSON.stringify(hist.outputs).slice(0, 200));
    continue;
  }
  const img = images[0];
  let buf;
  try {
    buf = await downloadOutput(img.filename, img.subfolder || '', img.type || 'output');
  } catch (e) {
    const root = findComfyOutputRoot();
    if (!root) throw e;
    const local = join(root, img.subfolder || '', img.filename);
    console.log('fallback read', local);
    buf = readFileSync(local);
  }
  const path = join(TMP, `seed-${seed}.png`);
  writeFileSync(path, buf);
  candidates.push({ seed, path, bytes: buf.length });
  console.log('saved candidate', path, buf.length);
}

if (!candidates.length) throw new Error('No ComfyUI candidates produced');

// Pick largest (usually sharpest detail) — Spacely-calibre room plates are dense
candidates.sort((a, b) => b.bytes - a.bytes);
const best = candidates[0];
console.log('selected', best);

const W = 1800;
const H = 1050;
const pngOut = join(OUT_DIR, 'gaming-room-build-kit.png');
const webpOut = join(OUT_DIR, 'gaming-room-build-kit.webp');
const examplePng = join(OUT_DIR, 'gaming-room-build-kit-example.png');
const exampleWebp = join(OUT_DIR, 'gaming-room-build-kit-example.webp');

await sharp(best.path)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9 })
  .toFile(pngOut);

await sharp(best.path)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .webp({ quality: 86 })
  .toFile(webpOut);

copyFileSync(pngOut, examplePng);
copyFileSync(webpOut, exampleWebp);

// Also keep a timestamped archive
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
copyFileSync(webpOut, join(OUT_DIR, `gaming-room-build-kit-${stamp}.webp`));

const meta = {
  selected_seed: best.seed,
  candidates: candidates.map((c) => ({ seed: c.seed, bytes: c.bytes })),
  output: { png: pngOut, webp: webpOut, width: W, height: H },
  prompt_positive: POSITIVE,
  reference: 'https://www.spacely.ai/room/gaming-room-design-ai',
  created_at: new Date().toISOString(),
};
writeFileSync(join(TMP, 'hero-meta.json'), JSON.stringify(meta, null, 2));
console.log('HERO READY', webpOut, (await sharp(webpOut).metadata()));
