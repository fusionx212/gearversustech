# GVT local / Netlify env

**Never commit `.env`.** Local `.env` is wired from `C:\Users\dalec\.secrets\master.env` (keys only logged).

## Present in local `.env` (finish pass 2026-07-16)

| Var | Status |
|---|---|
| `SUPABASE_URL` | SET |
| `SUPABASE_ANON_KEY` | SET |
| `SUPABASE_SERVICE_ROLE_KEY` | SET |
| `PRINTFUL_API_KEY` | SET |
| `STRIPE_SECRET_KEY` | SET — **PolicyandPlay account** `acct_1TMnl0Gm6OeSfImb` (`policyandplay.co.uk`) |
| `PUBLIC_STRIPE_KIT_URL` | SET locally + Netlify (Gaming Room Build Kit Payment Link) |
| `PUBLIC_STRIPE_GARAGE_KIT_URL` | SET locally (UK Garage Gym Build Kit Payment Link) — set on Netlify too |
| `PUBLIC_PRINTFUL_STORE_URL` | EMPTY — POD storefront not live yet |
| `RESEND_API_KEY` | On Netlify + `master.env`; **not** in GVT `.env` yet. Site still uses Netlify Forms. |

## Missing (block Amazon sync / ESP swap)

| Var | Needed for |
|---|---|
| `AMZ_ID` | Amazon Creators API token (fresh LwA — see `AMAZON-SYNC-BLOCKED.md`) |
| `AMZ_SECRET` | Amazon Creators API token |
| `BREVO_API_KEY` | ESP replace Netlify Forms (not found) |
| `MAILCHIMP_API_KEY` | alt ESP (not found) |

## Netlify dashboard (production SSR)

Must have at least:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PUBLIC_STRIPE_KIT_URL` ✅ set 2026-07-16
- optional `PUBLIC_PRINTFUL_STORE_URL`
- optional `RESEND_API_KEY` (present; unused until subscribe function ships)

## Stripe kit

- Payment Link: `PUBLIC_STRIPE_KIT_URL` (Gaming Room Build Kit £19)
- **Account:** PolicyandPlay (`acct_1TMnl0Gm6OeSfImb`) — **NEEDS DALE** if GVT revenue should be a separate Stripe account
- Product metadata: `site=gearversustech`, `sku=gvt-gaming-room-kit`
- CTAs: home + compare shell via `KitCTA` (build-time `PUBLIC_` env)

## Supabase category constraint — DONE

`gvt_articles.category` CHECK now allows: `gaming`, `best`, `smart-home`, `home-gym`.  
Home-gym spokes retagged to `category=home-gym`. Old `/best/compare/<gym-slug>/` URLs 301 → `/home-gym/compare/…` in `netlify.toml`.

## Photo drop-ins (optional; homepage stays comparison-first)

Place stills at:

- `public/images/spaces/gaming-room.jpg`
- `public/images/spaces/garage-gym.jpg`
- `public/images/spaces/man-cave.jpg`
- `public/images/spaces/pub-shed.jpg`

CSS already falls back to geometric workshop backgrounds. Do **not** put room bands back on the homepage.
