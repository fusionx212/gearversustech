# Amazon Creators API sync — blocked

**Date:** 2026-07-16 (updated finish pass)  
**Script:** `scripts/sync-amazon-products.mjs`  
**Runner:** `scripts/_run-amazon-sync.mjs` (maps UKAirConTracker `.env.local` Creators keys → `AMZ_ID`/`AMZ_SECRET` read-only)  
**Status:** BLOCKED — token fails with `invalid_client`

## Credential search (names only — no values logged)

| Location | Result |
|---|---|
| `C:\Users\dalec\.secrets\master.env` | No `AMZ_*` / `AMAZON_CREATORS_*` |
| `C:\Users\dalec\repos\gearversustech\.env` | No Amazon keys |
| Netlify env (gearversustech) | No Amazon keys |
| `C:\Users\dalec\projects\ukaircontracker\.env.local` | `AMAZON_CREATORS_API_CLIENT_ID` + `_SECRET` present (read-only check) |
| Mapped dry-run | **FAIL** `Client authentication failed` / `invalid_client` |

UKAirConTracker was **not modified**. Keys appear expired/revoked or not valid for Creators API LwA.

## Manual buy-box progress (without API)

| Product | Action |
|---|---|
| Wooting 60HE | Upserted ASIN `B0DJY46XTF` on `link_key=wooting-60he` (Amazon CTA works; image/price still need API) |
| Secretlab / Homey | Still D2C — skip Amazon; eBay/Awin later |
| Mirafit / generic gym names | No verified ASINs — left empty (do not invent ASINs) |
| Razer Viper V3 Pro / SmartThings Station | Not upserted without API title confirmation |

## Unblock (NEEDS DALE)

1. Create/retrieve fresh LwA credentials for Amazon Creators API (UK marketplace, tag `gearversustech-21`).
2. Add `AMZ_ID` / `AMZ_SECRET` to GVT `.env` + Netlify (never commit). Prefer GVT Associates credentials, not another site’s stale keys.
3. Run:

```bash
node --env-file=.env scripts/sync-amazon-products.mjs
node --env-file=.env scripts/sync-amazon-products.mjs --write
# optional known ASINs + GetItems enrich:
node --env-file=.env scripts/upsert-known-asins.mjs --with-api
```

4. Re-check buy-box readiness (winner + runner both need `amazon_asin` + ideally `image_url` + price).

## Coverage snapshot (pre-fresh-credentials)

Taken during finish pass: ~59 published compares; ~33 with both sides image+ASIN; remainder partial/empty mostly D2C + gym generics + sync misses.
