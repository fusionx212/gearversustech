# Gaming Room Build Kit — example pipeline

## Open these
- **Example / quality bar (open first):** `public/images/kits/gaming-room-build-kit-example.webp`  
  `file:///C:/Users/dalec/repos/gearversustech/public/images/kits/gaming-room-build-kit-example.webp`
- **With real SKU cutouts (Wooting / Superlight / HyperX):** `.../gaming-room-build-kit-example-cutouts.webp`
- **Live kit hero (replaced locally):** `.../gaming-room-build-kit.webp` ← same cinematic plate
- **Deploy:** blocked by `netlify-deploy-STOP.flag` (credit cap). Needs Dale clear + `netlify-release.ps1 -Force`.

## Pipeline (no secrets)
1. ComfyUI was down on `:8188` — started `D:\ComfyUI_windows_portable` (loopback).
2. **Model:** Juggernaut XL v10 (`juggernaut_xl_v10.safetensors`)
3. **Plates:**
   - `desk-plate.workflow.json` — empty-desk prompts still spawned gear
   - `gvt_gaming_desk_plate_00001_.png` — elevated 3/4 triple-monitor cyan/magenta (best packshot angle match)
   - `full-scene.workflow.json` seed `2026071619`, 34 steps, CFG 5.0, `dpmpp_2m_sde`/`karras`, 1536×896 — straight-on ultrawide cinematic (best pure quality)
4. **Real cutouts** from `public/images/products/*-cut.png`:
   - Wooting 60HE (cropped; cleaning blower removed)
   - Logitech G Pro X Superlight 2
   - HyperX Cloud III Wireless
   - Monitor left as Comfy plate (Alienware marketing packshot overlays killed the scene)
5. **Composite:** `scripts/media/gaming-kit-example/ship-example.mjs` — feathered alpha, contact shadows, cool tint, vignette
6. **Rejected:** img2img denoise 0.28 (product drift / voids); hard mat “cards” under cutouts

## Full-scene prompt (abbrev)
cinematic photograph, premium UK gaming desk, ultrawide monitor, compact black board + wireless mouse + closed-back headset, cyan bias + magenta LED edge, shallow DOF 35mm, no text/logos/watermarks
