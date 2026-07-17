# GVT catalogue engine

Gear Versus Tech should publish from one product graph, not maintain separate copies of a product in reviews, comparisons, kits and Studio.

## Current wiring

- `gvt_articles` is the published comparison record and names its winner and runner-up.
- `gvt_affiliate_links` is the product record: retailer identifiers, price, image, score, review synthesis, drawbacks and usage ideas.
- Comparison pages resolve their product detail from `gvt_affiliate_links` at request time.
- `/reviews/[link_key]/` turns any review-ready product record into a standalone review with Product and Review JSON-LD.
- Studio resolves each generic room slot through the current published comparison winner, then through that winner's live affiliate record.
- `/sitemap-reviews.xml` exposes review-ready records to search and answer engines.

One approved product update therefore changes the standalone review, comparison detail, Studio product pick and affiliate destination without a Netlify deploy.

## Operating loop

### Daily: availability and commercial data

1. Run `scripts/sync-amazon-products.mjs --write` outside Netlify.
2. Refresh exact ASIN, UK price and primary product image only when product identity passes the existing brand/model matcher.
3. Run `scripts/qa-affiliate-links.mjs` and `npm run qa:catalogue`.
4. Keep the previous known-good record when a retailer lookup is ambiguous or temporarily unavailable.

This is suitable for a scheduled GitHub Action or Supabase job, so it consumes no Netlify build credits.

### Weekly: relevance queue

Use `npm run qa:catalogue` to prioritise:

- published winners with no complete review;
- products older than the product freshness threshold;
- comparisons older than the editorial threshold;
- missing product photography or exact retailer destinations;
- discontinued products and changed model generations.

Default thresholds are 30 days for products and 120 days for comparisons. Override them with `GVT_PRODUCT_MAX_AGE_DAYS` and `GVT_COMPARISON_MAX_AGE_DAYS`. Add `--strict` when warnings must fail a release gate.

### Review refresh: evidence, synthesis, independent QA

The autonomous reviewer should collect a minimum evidence pack before writing:

1. official manufacturer specifications and manuals;
2. current retailer identity, availability and price;
3. at least two independent, attributable review sources;
4. recurring owner themes, separated from verified technical facts;
5. comparison context: why this product wins this use case and where it loses.

One model writes the structured product update. A separate review pass rejects unsupported claims, model/region mismatches, fake first-hand testing language, stale prices and conclusions that do not follow from the evidence. Only a passing update is patched into the live product row. A failed update leaves the existing review untouched and enters the next queue.

The site should say “evidence-led review synthesis” unless GVT physically tested the product. Source links and the evidence date should be visible on the review page once evidence fields are added to Supabase.

## Next database addition

Before fully automated review publication, add separate timestamps and evidence metadata to `gvt_affiliate_links`: `price_checked_at`, `reviewed_at`, `review_status`, `review_confidence`, `review_model`, `review_prompt_version` and `evidence`. Do not use the generic `updated_at` value as proof that both price and editorial evidence are fresh.

That migration should be applied as one reviewed Supabase change. Until then, the health report intentionally treats `updated_at` as a conservative shared freshness signal.

## Publish gate

A product can be surfaced as a standalone review when it has a score, honest take and review synthesis. A fully autonomous publisher should additionally require:

- exact product identity and UK variant;
- a specific buy route or a clearly disclosed unavailable state;
- a valid image or approved mockup;
- source evidence within its refresh window;
- no unresolved contradictions in price, dimensions or specification;
- independent AI QA pass;
- valid comparison, review schema and sitemap checks.

The comparison remains the primary customer decision page. The standalone review supplies depth, and Studio demonstrates fit; neither creates a second winner independent of the comparison record.
