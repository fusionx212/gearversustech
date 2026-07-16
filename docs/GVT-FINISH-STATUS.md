# GVT finish status board — 2026-07-16

| Area | Status | Notes |
|---|---|---|
| Homepage comparison-first | **DONE** | Live; room hubs demoted |
| Amazon sync (Creators API) | **BLOCKED** | Only Creators keys found (UKAirConTracker `.env.local`); `invalid_client`. See `AMAZON-SYNC-BLOCKED.md` |
| Manual ASIN (Wooting) | **DONE** | `B0DJY46XTF` on `wooting-60he` — CTA live; image/price need API |
| Buy-box coverage maximize | **BLOCKED** | Needs fresh `AMZ_ID`/`AMZ_SECRET` |
| `home-gym` category CHECK | **DONE** | Migration applied; 10 spokes retagged |
| Home-gym URLs + 301s | **DONE** | Routes + `netlify.toml` redirects from `/best/compare/…` |
| Stripe kit CTA | **DONE** (account caveat) | Link on Netlify `PUBLIC_STRIPE_KIT_URL`; home + compare `KitCTA` |
| Stripe account ownership | **NEEDS DALE** | Live key = PolicyandPlay `acct_1TMnl0Gm6OeSfImb` |
| Email capture | **DONE** (Forms) | Netlify Forms + improved thank-you. Resend key exists but unused; no Brevo/Mailchimp |
| Content thicken (thin pages) | **DONE** | 6 thin articles expanded + cluster links |
| Optional +10 compares | **SKIPPED** | Buy-box pipeline blocked |
| Space images on homepage | **SKIPPED** | Per Dale — keep comparison-first |
| Printful POD create | **BLOCKED** / prep | API stores OK; products 400; Etsy draft only in distribution packet |
| Social publish | **SKIPPED** | Telegram packet only — no Reddit/X |
| Build / commit / push | **DONE** | `github/main` @ `397f50ac` (+ finish commits) |
| Netlify prod deploy | **DONE** | CLI prod deploy `6a5925c037a761c6eb895c95` (build hooks were not creating new deploys; STOP flag overridden per Dale Cursor approval) |

## NEEDS DALE

1. Fresh Amazon Creators API LwA credentials for tag `gearversustech-21` (stale UKAirConTracker keys → `invalid_client`)
2. Confirm Stripe kit revenue should stay on PolicyandPlay account (or provide GVT Stripe keys)
3. Optional: recreate Printful products after dashboard designs (API product list 400)
