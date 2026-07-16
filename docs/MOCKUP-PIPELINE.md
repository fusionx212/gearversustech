# Mockup pipeline — GearVersusTech

Repeatable recipe for kit heroes and product mockups. **Do not invent fake keyboards.**

## Honest history (2026-07-16)

| Pass | What was used | Result |
|------|----------------|--------|
| v1 (rubbish) | `sharp` white-key cutouts of Amazon `_SL500_` thumbs composited onto **SVG cartoon** desk/garage plates (`scripts/make-product-mockups.mjs`, `make-kit-room-mockups.mjs`) | Muddy collage, wrong geometry, ~40KB hero WebP |
| ComfyUI | Checked `127.0.0.1:8188` — **down**. Portable install has **empty checkpoints** (`put_checkpoints_here`). | Not used |
| v2 (this pass) | Amazon scraped `hiRes` / `_AC_SL1500_` → **rembg** → clean product cards; kit **hero** = Unsplash cinematic desk plate (RGB atmosphere) + kit chrome; SKU sheet + mockups for pack/compare | Sharp SKUs + premium room photography without floating-slop collage |

**Quality bar (taste only):** [elevenmark — 25 epic gaming room ideas](https://elevenmark.com/blogs/marks-magic/25-epic-gaming-room-ideas-best-setups-displays-decor-tips-marks-magic) — cinematic lighting, sharp peripherals, believable RGB. Do **not** copy their images/IP.

## Preferred pipeline (when ComfyUI is healthy)

1. **Exact SKU photo** — scrape Amazon `hiRes` or official CDN (never invent ASINs).
2. **Cutout** — `rembg i source.jpg cut.png` (or GIMP). Scrub dark fringes.
3. **Room plate** — ComfyUI SDXL/Flux with **clean prompts** + product **IP-Adapter / reference** so geometry matches the real SKU; **or** licensed photoreal plate (Unsplash).
4. **Composite** — correct scale/perspective, contact shadows, matching colour grade.
5. **Deliver** — PNG master + WebP q≈92–94. Probe size/sharpness before ship.

### Clean prompt sketch (ComfyUI room plate only)

```
Positive: cinematic UK bedroom gaming desk, dark walls, magenta/purple LED bias light
behind monitor, matte wood desk, shallow depth of field, sharp focus on desk surface,
photoreal, 35mm, no people, empty desk ready for product composite

Negative: blurry, deformed keyboard, wrong brand logos, muddy, collage, watermark,
text overlay, extra fingers, lowres, jpeg artifacts, cartoon, illustration
```

Then composite **real** rembg cutouts (never ask the model to redraw the Wooting/Alienware).

## Current scripts

| Script | Role |
|--------|------|
| `scripts/rebuild-gaming-room-hero.py` | **Canonical** Gaming Room hero + product cards + mockups + SKU sheet |
| `scripts/make-product-mockups.mjs` | Legacy sharp/SVG path — **do not use for public heroes** |
| `scripts/make-kit-room-mockups.mjs` | Legacy kit composite — **do not use for public heroes** |

```bash
# Prefetch hiRes into tmp/mockup-src/ (Amazon scrape), then:
python scripts/rebuild-gaming-room-hero.py
```

## Asset map

| Asset | Path |
|-------|------|
| Kit hero | `/images/kits/gaming-room-build-kit.webp` (+ `.png` master) |
| SKU sheet | `/images/kits/gaming-room-build-kit-skus.webp` |
| Pack thumbs | `/images/products/{link_key}.webp` |
| Compare mockups | `/images/mockups/{link_key}.webp` |
| Plate | `public/images/rooms/desk-cinematic.jpg` (Unsplash License) |

## Why hero is plate-first (this pass)

Floating rembg cutouts onto a lifestyle plate still read as **collage** (lighting/perspective mismatch) and failed the elevenmark bar. Until ComfyUI has weights + IP-Adapter for product-locked scenes, the honest premium move is:

1. Ship **cinematic photoreal hero** for conversion mood.
2. Ship **exact Amazon SKUs** sharp in pack contents / mockups / SKU sheet.

Revisit full in-scene product composite when ComfyUI checkpoints are installed and a pinned workflow exists under the local-media-production skill.
