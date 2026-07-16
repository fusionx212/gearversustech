# Amazon Creators API sync — blocked

**Date:** 2026-07-16  
**Script:** `scripts/sync-amazon-products.mjs`  
**Status:** BLOCKED — cannot refresh ASINs/images/prices

## Missing credentials

Local `.env` and `C:\Users\dalec\.secrets\master.env` do not define:

- `AMZ_ID` (Creators API client id)
- `AMZ_SECRET` (Creators API client secret)

Dry-run fails with Amazon `invalid_request` / missing `client_id`.

## Unblock

1. Create/retrieve LwA credentials for Amazon Creators API (UK marketplace, tag `gearversustech-21`).
2. Add `AMZ_ID` / `AMZ_SECRET` to local `.env` (from master secrets — never commit).
3. Run:

```bash
node --env-file=.env scripts/sync-amazon-products.mjs
node --env-file=.env scripts/sync-amazon-products.mjs --write
```

4. Re-check buy-box readiness (winner + runner both need `amazon_asin` + `image_url`).

## Known gaps until sync

D2C / non-Amazon or never-synced names will stay empty: Wooting 60HE, Secretlab Titan Evo, Mirafit/Rogue gym SKUs, Razer Viper V3 Pro (if not yet linked), SmartThings Station, generic “adjustable dumbbells”, etc.
