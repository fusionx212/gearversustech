#!/usr/bin/env python3
"""
Gaming Room kit visual rebuild — premium path without ComfyUI.

OLD (admit): SVG cartoon desk + SL500 Amazon thumbs + sharp white-key cutouts.
ComfyUI: offline @ 8188, checkpoints folder empty — cannot run IP-Adapter/img2img.

NEW:
  Hero  = photoreal cinematic Unsplash desk plate (quality bar atmosphere)
          + restrained kit chrome (no floating SKU collage)
  Pack  = Amazon hiRes → rembg → alpha scrub → dark product cards / mockups
  Docs  = docs/MOCKUP-PIPELINE.md

Usage:
  python scripts/rebuild-gaming-room-hero.py
"""
from __future__ import annotations

import io
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "tmp" / "mockup-src"
CUT = ROOT / "tmp" / "mockup-cuts"
PRODUCTS = ROOT / "public" / "images" / "products"
MOCKUPS = ROOT / "public" / "images" / "mockups"
KITS = ROOT / "public" / "images" / "kits"
ROOMS = ROOT / "public" / "images" / "rooms"

W, H = 1920, 1080

SOURCES = {
    "alienware-aw2725df": ["alienware-aw2725df-hi.jpg"],
    "wooting-80he": ["wooting-80he.jpg"],
    "wooting-60he": ["wooting-60he-hi.jpg"],
    "hyperx-cloud-iii-wireless": ["hyperx-cloud-iii-wireless-hi.jpg"],
    "govee-g1": ["govee-g1-hi.jpg"],
    "tp-link-tapo-p110": ["tp-link-tapo-p110-hi.jpg"],
    "keychron-k2-he": ["keychron-k2-he-hi.jpg"],
    "corsair-k70-core": ["corsair-better.jpg"],
    "noblechairs-hero": ["noblechairs-better.jpg"],
    "logitech-g-pro-x-superlight-2": [
        "logitech-g-pro-x-superlight-2-hi.jpg",
        "logitech-g-pro-x-superlight-2.jpg",
    ],
}


def pick_source(key: str) -> Path | None:
    for name in SOURCES.get(key, []):
        p = SRC / name
        if p.exists() and p.stat().st_size > 2000:
            return p
    for ext in (".jpg", ".png"):
        p = PRODUCTS / f"{key}{ext}"
        if p.exists() and p.stat().st_size > 2000:
            return p
    return None


def scrub_alpha(im: Image.Image, thr: int = 24) -> Image.Image:
    """Kill rembg mud / near-opaque dark rectangles around products."""
    import numpy as np

    im = im.convert("RGBA")
    arr = np.array(im)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    kill = (a < thr) | ((r < 18) & (g < 18) & (b < 18) & (a < 220))
    arr[..., 3] = np.where(kill, 0, a)
    return Image.fromarray(arr, "RGBA")


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    bbox = im.getchannel("A").getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    return im.crop(
        (max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad))
    )


def cutout(key: str, src: Path) -> Path:
    CUT.mkdir(parents=True, exist_ok=True)
    out = CUT / f"{key}-cut.png"
    print(f"cutout {key} ← {src.name}")
    im = Image.open(io.BytesIO(remove(src.read_bytes()))).convert("RGBA")
    if key == "wooting-60he":
        w, h = im.size
        im = im.crop((0, 0, int(w * 0.72), h))
    im = scrub_alpha(im)
    im = trim_alpha(im)
    # soften fringe
    a = im.getchannel("A").filter(ImageFilter.GaussianBlur(radius=0.6))
    im.putalpha(a)
    im.save(out, "PNG")

    PRODUCTS.mkdir(parents=True, exist_ok=True)
    im.save(PRODUCTS / f"{key}-cut.png", "PNG")
    card = im.copy()
    card.thumbnail((820, 820), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (900, 900), (12, 14, 20, 255))
    canvas.alpha_composite(card, ((900 - card.width) // 2, (900 - card.height) // 2))
    canvas.convert("RGB").save(PRODUCTS / f"{key}.webp", "WEBP", quality=93, method=6)
    canvas.convert("RGB").save(PRODUCTS / f"{key}.jpg", "JPEG", quality=93)
    return out


def load_font(size: int):
    for name in (
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/seguisb.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def build_hero():
    """
    Quality bar first: keep cinematic photography intact.
    Do NOT paste floating SKU collage over it — that is what looked rubbish.
    Exact SKUs live sharp in pack-grid product cards / mockups.
    """
    plate = Image.open(ROOMS / "desk-cinematic.jpg").convert("RGB")
    pw, ph = plate.size
    ratio = W / H
    if pw / ph > ratio:
        nw = int(ph * ratio)
        left = (pw - nw) // 2
        plate = plate.crop((left, 0, left + nw, ph))
    else:
        nh = int(pw / ratio)
        top = max(0, (ph - nh) // 4)
        plate = plate.crop((0, top, pw, top + nh))
    plate = plate.resize((W, H), Image.Resampling.LANCZOS)
    plate = ImageEnhance.Contrast(plate).enhance(1.06)
    plate = ImageEnhance.Color(plate).enhance(1.08)

    base = plate.convert("RGBA")
    # subtle bottom gradient for legibility of caption
    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for i in range(160):
        a = int(170 * (i / 160) ** 1.4)
        y = H - 160 + i
        gd.line([(0, y), (W, y)], fill=(0, 0, 0, a))
    base = Image.alpha_composite(base, grad)

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    title_font = load_font(34)
    sub_font = load_font(20)
    chip_font = load_font(18)
    d.rounded_rectangle((40, 40, 620, 150), radius=14, fill=(8, 10, 14, 200))
    d.text((64, 58), "GAMING ROOM BUILD KIT", font=title_font, fill=(229, 163, 24, 255))
    d.text(
        (64, 104),
        "Cinematic desk staging · kit SKUs in pack contents",
        font=sub_font,
        fill=(210, 216, 224, 255),
    )
    # SKU caption — text, not muddy cutouts
    d.rounded_rectangle((40, H - 110, W - 40, H - 36), radius=12, fill=(8, 10, 14, 185))
    d.text(
        (64, H - 88),
        "In the pack: Alienware AW2725DF · Wooting 80HE / 60HE · Superlight 2 · Cloud III Wireless · Govee G1 · Tapo P110",
        font=chip_font,
        fill=(230, 234, 240, 255),
    )
    base = Image.alpha_composite(base, overlay)

    rgb = base.convert("RGB")
    KITS.mkdir(parents=True, exist_ok=True)
    png = KITS / "gaming-room-build-kit.png"
    webp = KITS / "gaming-room-build-kit.webp"
    rgb.save(png, "PNG", optimize=True)
    rgb.save(webp, "WEBP", quality=94, method=6)
    print("hero", png.stat().st_size, webp.stat().st_size)


def contact_shadow(w: int, h: int) -> Image.Image:
    sh = Image.new("RGBA", (max(2, w), max(2, int(h * 0.25))), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse((0, 0, sh.width, sh.height), fill=(0, 0, 0, 170))
    return sh.filter(ImageFilter.GaussianBlur(radius=max(6, w // 40)))


def build_product_mockups(cuts: dict[str, Path]):
    """Single-SKU mockups: dark cinematic desk crop + one clean cutout."""
    MOCKUPS.mkdir(parents=True, exist_ok=True)
    plate = Image.open(ROOMS / "desk-cinematic.jpg").convert("RGB")
    plate = ImageEnhance.Brightness(plate).enhance(0.55)
    plate = ImageEnhance.Contrast(plate).enhance(1.15)
    plate = plate.resize((1600, 1000), Image.Resampling.LANCZOS)
    # desk band
    desk = Image.new("RGBA", (1600, 1000), (0, 0, 0, 0))
    dd = ImageDraw.Draw(desk)
    dd.rectangle((0, 620, 1600, 1000), fill=(10, 10, 14, 160))
    scene_base = Image.alpha_composite(plate.convert("RGBA"), desk)

    for key, path in cuts.items():
        cut = Image.open(path).convert("RGBA")
        cut.thumbnail((720, 520), Image.Resampling.LANCZOS)
        scene = scene_base.copy()
        left = (scene.width - cut.width) // 2
        top = 1000 - cut.height - 140
        sh = contact_shadow(cut.width, cut.height)
        scene.alpha_composite(sh, (left, top + cut.height - sh.height // 2))
        scene.alpha_composite(cut, (left, top))
        out = MOCKUPS / f"{key}.webp"
        scene.convert("RGB").save(out, "WEBP", quality=92, method=6)
        print("mockup", out.name, out.stat().st_size)


def build_sku_sheet(cuts: dict[str, Path]):
    """Optional premium SKU sheet for social/kit detail — clean dark studio."""
    keys = [
        "alienware-aw2725df",
        "wooting-80he",
        "logitech-g-pro-x-superlight-2",
        "hyperx-cloud-iii-wireless",
        "govee-g1",
        "tp-link-tapo-p110",
    ]
    sheet = Image.new("RGB", (1920, 900), (12, 14, 20))
    # magenta glow
    glow = Image.new("RGBA", (1920, 900), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(60):
        gd.ellipse((760 - i * 3, 200 - i, 1160 + i * 3, 700 + i), outline=(160, 40, 200, 40 - i // 2))
    sheet = Image.alpha_composite(sheet.convert("RGBA"), glow)
    items = []
    for k in keys:
        if k in cuts:
            im = Image.open(cuts[k]).convert("RGBA")
            im.thumbnail((280, 240), Image.Resampling.LANCZOS)
            items.append(im)
    if not items:
        return
    gap = 36
    total = sum(i.width for i in items) + gap * (len(items) - 1)
    x = (1920 - total) // 2
    y = 320
    for im in items:
        sh = contact_shadow(im.width, im.height)
        sheet.alpha_composite(sh, (x, y + im.height - sh.height // 2))
        sheet.alpha_composite(im, (x, y))
        x += im.width + gap
    d = ImageDraw.Draw(sheet)
    d.text((80, 60), "GAMING ROOM BUILD KIT — PACK SKUs", font=load_font(32), fill=(229, 163, 24))
    d.text(
        (80, 110),
        "Exact Amazon product photos · rembg cutouts · no invented keyboards",
        font=load_font(18),
        fill=(200, 208, 218),
    )
    out = KITS / "gaming-room-build-kit-skus.webp"
    sheet.convert("RGB").save(out, "WEBP", quality=92, method=6)
    sheet.convert("RGB").save(KITS / "gaming-room-build-kit-skus.png", "PNG", optimize=True)
    print("sku sheet", out.stat().st_size)


def main():
    cuts = {}
    for key in SOURCES:
        src = pick_source(key)
        if not src:
            print("SKIP", key)
            continue
        cuts[key] = cutout(key, src)
    build_hero()
    build_product_mockups(cuts)
    build_sku_sheet(cuts)
    meta = {
        "old_pipeline": "SVG cartoon desk + sharp white-key + SL500 thumbs — NOT ComfyUI",
        "comfyui": "offline; no checkpoints",
        "hero": "Unsplash cinematic desk plate + kit chrome (no floating collage)",
        "skus": "amazon hiRes → rembg → dark cards/mockups + sku sheet",
        "quality_bar": "elevenmark gaming-room photography — atmosphere for hero",
        "products": sorted(cuts),
    }
    (ROOT / "tmp" / "gaming-room-hero-meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
