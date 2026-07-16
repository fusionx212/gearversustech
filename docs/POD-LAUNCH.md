# GVT Printful POD launch checklist

**Status:** API key present in estate secrets (`PRINTFUL_API_KEY`). Site CTAs use `PUBLIC_PRINTFUL_STORE_URL` when set; otherwise “POD packs (coming)” placeholder.

**Do not publish to Etsy/social until Telegram approve.** This doc is draft-only.

## Products to create (manual or API)

Original IP only — no licensed game art.

| Working name | Printful base | Format | Retail band |
|---|---|---|---|
| Gaming Desk Blueprint Pack | Poster (18×24) + digital PNG | Pack of 3 layouts | £24–£39 |
| Garage Gym Wall Plan | Poster (18×24) | Single + digital | £18–£28 |
| Man Cave Neon Grid | Canvas / poster | Personalised name optional | £22–£35 |
| Pub Shed Signage Pack | Poster set of 3 | Physical + printable | £24–£39 |

## Suggested Printful catalog SKUs (bases)

Confirm live Printful catalog IDs in dashboard (IDs change):

1. **Enhanced Matte Paper Poster** — common base for blueprint packs  
2. **Canvas** — premium man-cave / pub-shed  
3. **Digital download** product (if using Printful digital) — or deliver via Stripe kit zip  

## Sync steps

1. Create designs in Canva / local ComfyUI (workshop aesthetic, Space Grotesk titles).  
2. Upload to Printful → create products → enable UK shipping.  
3. Set `PUBLIC_PRINTFUL_STORE_URL` on Netlify to store or product collection URL.  
4. Optional: Etsy listing draft in `docs/DISTRIBUTION-PACKET-01.md` — go live only after Telegram tap.  
5. Site already has POD CTA on hubs via `KitCTA`.

## API probe (local)

```bash
node --env-file=.env scripts/printful-probe.mjs
```

Does not create products unless `--write` is added later (not shipped yet).
