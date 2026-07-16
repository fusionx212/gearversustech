# GVT local / Netlify env

**Never commit `.env`.** Local `.env` is wired from `C:\Users\dalec\.secrets\master.env` (keys only logged).

## Present in local `.env` (this session)

| Var | Status |
|---|---|
| `SUPABASE_URL` | SET |
| `SUPABASE_ANON_KEY` | SET |
| `SUPABASE_SERVICE_ROLE_KEY` | SET |
| `PRINTFUL_API_KEY` | SET |
| `STRIPE_SECRET_KEY` | SET (account may be PolicyandPlay — verify before creating GVT SKUs) |
| `PUBLIC_STRIPE_KIT_URL` | EMPTY — set after Payment Link exists |
| `PUBLIC_PRINTFUL_STORE_URL` | optional storefront URL |

## Missing (block Amazon sync / ESP)

| Var | Needed for |
|---|---|
| `AMZ_ID` | Amazon Creators API token |
| `AMZ_SECRET` | Amazon Creators API token |
| `BREVO_API_KEY` | ESP replace Netlify Forms |
| `MAILCHIMP_API_KEY` | alt ESP |

## Netlify dashboard (production SSR)

Must have at least:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PUBLIC_STRIPE_KIT_URL` (after Stripe Payment Link)
- optional `PUBLIC_PRINTFUL_STORE_URL`

## Stripe kit (created 2026-07-16)

- Payment Link: set as `PUBLIC_STRIPE_KIT_URL` (Gaming Room Build Kit £19)
- **Account used:** `policyandplay.co.uk` (`acct_1TMnl0Gm6OeSfImb`) — confirm this is intentional for GVT revenue or recreate under a GVT Stripe account
- Product metadata: `site=gearversustech`, `sku=gvt-gaming-room-kit`

## Supabase category constraint (WAITING_APPROVAL)

`gvt_articles.category` CHECK currently allows only: `gaming`, `best`, `smart-home`.  
`home-gym` inserts fail with `23514`. Home-gym articles were seeded as `category=best` / `subcategory=Home Gym` until Dale approves:

```sql
-- APPROVAL REQUIRED (shared DB schema)
ALTER TABLE gvt_articles DROP CONSTRAINT IF EXISTS gvt_articles_category_check;
ALTER TABLE gvt_articles ADD CONSTRAINT gvt_articles_category_check
  CHECK (category IN ('gaming','best','smart-home','home-gym'));
```

Then re-tag home-gym slugs to `category=home-gym`.

## Photo drop-ins (ComfyUI was down)

Place stills at:

- `public/images/spaces/gaming-room.jpg`
- `public/images/spaces/garage-gym.jpg`
- `public/images/spaces/man-cave.jpg`
- `public/images/spaces/pub-shed.jpg`

CSS already falls back to geometric workshop backgrounds.
