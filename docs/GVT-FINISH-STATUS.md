# GVT finish status board — 2026-07-16 (kits + quality pass)

| Area | Status | Notes |
|---|---|---|
| Homepage comparison-first | **DONE** | Live; room hubs demoted; kits are conversion layer off compares |
| Amazon sync (Creators API) | **BLOCKED** | `invalid_client` — see `AMAZON-SYNC-BLOCKED.md` |
| Manual ASIN + images | **PARTIAL** | Wooting image fixed via Amazon CDN; Viper UK dp 404 (ASIN needs Dale verify); 39/40 other links had images |
| Product quality enrichment | **DONE** (batch) | 19 products: score, honest_take, review_summary, themes, buy/skip, usage, stats, mockup_url |
| In-room product mockups | **DONE** (18) | `public/images/mockups/*.webp` from real Amazon photos + sharp white-key cutout |
| Kits in Supabase | **DONE** | `gvt_kits` + `gvt_kit_items` — Gaming Room (20 items) + UK Garage Gym (11 items) |
| Kit full-room mockups | **DONE** | `public/images/kits/gaming-room-build-kit.webp` (6 real SKUs); garage hero pending gym ASINs |
| `/kits/` pages | **DONE** | Index + `/kits/[slug]/` with tiers, contents grid, reviews, setup notes |
| Kit CTA photo + price | **DONE** | `KitCTA` shows mockup + £19 + link to pack contents |
| Stripe Gaming Room kit | **DONE** | `PUBLIC_STRIPE_KIT_URL` (PolicyandPlay acct caveat) |
| Stripe Garage Gym kit | **DONE** | Payment Link created; set `PUBLIC_STRIPE_GARAGE_KIT_URL` |
| Priority compare thicken | **DONE** | 15 money pages got deep-dive blocks + ProductDepth UI |
| Buy-box maximize | **BLOCKED** | Needs fresh `AMZ_ID`/`AMZ_SECRET` |
| Email capture | **DONE** | Netlify Forms |
| Printful POD | **BLOCKED** / prep | API product create 400 |
| Social publish | **SKIPPED** | Telegram only |

## Live kit URLs

- https://gearversustech.com/kits/
- https://gearversustech.com/kits/gaming-room-build-kit/
- https://gearversustech.com/kits/uk-garage-gym-build-kit/
- Example enriched compare: https://gearversustech.com/gaming/compare/wooting-60he-vs-razer-huntsman-v3-pro/
- Kit mockup asset: https://gearversustech.com/images/kits/gaming-room-build-kit.webp
- **Netlify prod:** `6a59310af48d45c42cc5b5c6` · **github/main:** `17195c62`

## NEEDS DALE

1. Fresh Amazon Creators API LwA credentials for tag `gearversustech-21`
2. Confirm Stripe kit revenue stays on PolicyandPlay `acct_1TMnl0Gm6OeSfImb` (or provide GVT Stripe keys)
3. Verify Razer Viper V3 Pro UK ASIN (B0CXL5V4VH returned 404 on amazon.co.uk/dp)
4. Optional: gym product ASINs for Mirafit/rubber so garage kit gets real cutouts
5. Set Netlify env `PUBLIC_STRIPE_GARAGE_KIT_URL` if CLI env set was not run
