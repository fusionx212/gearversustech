import sharp from 'sharp';
import { copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const K = join(ROOT, 'public', 'images', 'kits');
const PRODUCT = join(ROOT, 'public', 'images', 'products');
const pure = 'D:/ComfyUI_windows_portable/ComfyUI/output/gvt_gaming_full_scene_00001_.png';
const plate = 'D:/ComfyUI_windows_portable/ComfyUI/output/gvt_gaming_desk_plate_00001_.png';
const W = 1800;
const H = 1050;

async function feather(buf, r = 2.5) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const a = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) a[i] = data[i * channels + 3];
  const b = await sharp(a, { raw: { width, height, channels: 1 } }).blur(r).raw().toBuffer();
  for (let i = 0; i < width * height; i++) {
    const v = a[i];
    data[i * channels + 3] = v < 230 ? Math.min(v, b[i]) : v;
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

async function cut(key, { maxH, crop, rotate = 0 }) {
  const src = join(PRODUCT, `${key}-cut.png`);
  let img = sharp(src).ensureAlpha();
  if (crop) {
    const m = await sharp(src).metadata();
    img = sharp(src)
      .ensureAlpha()
      .extract({
        left: Math.round(crop.left * m.width),
        top: Math.round(crop.top * m.height),
        width: Math.round(crop.width * m.width),
        height: Math.round(crop.height * m.height),
      });
  }
  let buf = await img
    .resize({ height: maxH, fit: 'inside' })
    .modulate({ brightness: 0.87, saturation: 0.8 })
    .png()
    .toBuffer();
  if (rotate) {
    buf = await sharp(buf)
      .rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }
  buf = await feather(buf, 2.6);
  buf = await sharp(buf).tint({ r: 205, g: 220, b: 245 }).png().toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}

async function shadow(c) {
  const sw = Math.round(c.w * 1.1);
  const sh = Math.max(14, Math.round(c.h * 0.18));
  const svg = Buffer.from(
    `<svg width="${sw}" height="${sh}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="${sw / 2}" cy="${sh / 2}" rx="${sw / 2}" ry="${sh / 2}" fill="rgba(0,0,0,0.55)"/></svg>`
  );
  const buf = await sharp(svg).blur(11).png().toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}

// 1) Pure cinematic quality bar → live hero + plate sidecar
const pureBuf = await sharp(pure).resize(W, H, { fit: 'cover' }).png().toBuffer();
await sharp(pureBuf).png({ compressionLevel: 9 }).toFile(join(K, 'gaming-room-build-kit.png'));
await sharp(pureBuf).webp({ quality: 93 }).toFile(join(K, 'gaming-room-build-kit.webp'));
await sharp(pureBuf).webp({ quality: 93 }).toFile(join(K, 'gaming-room-build-kit-plate-cinematic.webp'));
console.log('hero = pure cinematic');

// 2) Required EXAMPLE path = real cutouts on elevated 3/4 plate (no mat cards)
const base = await sharp(plate)
  .resize(W, H, { fit: 'cover' })
  .modulate({ brightness: 0.95, saturation: 1.06 })
  .png()
  .toBuffer();
const layers = [];
const placements = [
  {
    key: 'wooting-60he',
    maxH: 145,
    left: 640,
    top: 650,
    crop: { left: 0.02, top: 0.02, width: 0.78, height: 0.7 },
    rotate: -3,
  },
  { key: 'logitech-g-pro-x-superlight-2', maxH: 70, left: 1060, top: 705, rotate: 14 },
  { key: 'hyperx-cloud-iii-wireless', maxH: 210, left: 1300, top: 400, rotate: -8 },
];
for (const p of placements) {
  const c = await cut(p.key, p);
  const sh = await shadow(c);
  layers.push({
    input: sh.buf,
    left: p.left + Math.round((c.w - sh.w) / 2) + 4,
    top: p.top + c.h - Math.round(sh.h * 0.4),
  });
  layers.push({ input: c.buf, left: p.left, top: p.top });
  console.log(p.key, c.w, c.h);
}
const grade = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="v" cx="50%" cy="40%" r="78%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
  </radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);
const composed = await sharp(base)
  .composite([...layers, { input: await sharp(grade).png().toBuffer(), left: 0, top: 0 }])
  .png()
  .toBuffer();
await sharp(composed).png({ compressionLevel: 9 }).toFile(join(K, 'gaming-room-build-kit-example.png'));
await sharp(composed).webp({ quality: 92 }).toFile(join(K, 'gaming-room-build-kit-example.webp'));
// Also keep a pure cinematic copy under -cinematic-alt for Dale to open if cutouts feel collage-y
await sharp(pureBuf).png({ compressionLevel: 9 }).toFile(join(K, 'gaming-room-build-kit-cinematic-alt.png'));
await sharp(pureBuf).webp({ quality: 93 }).toFile(join(K, 'gaming-room-build-kit-cinematic-alt.webp'));
console.log('example = cutouts; cinematic-alt = pure quality bar');

if (!existsSync(pure)) throw new Error('missing pure plate');
copyFileSync(pure, join(ROOT, 'scripts', 'media', 'gaming-kit-example', 'desk-plate.png'));
