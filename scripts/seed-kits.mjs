/**
 * Upsert gvt_kits + gvt_kit_items from scripts/data/kits-catalog.json
 *
 *   node --env-file=.env scripts/seed-kits.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const __dirname = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(
  readFileSync(join(__dirname, 'data', 'kits-catalog.json'), 'utf8')
);

async function sb(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

for (const kit of catalog.kits) {
  const stripeUrl =
    (kit.stripe_env && process.env[kit.stripe_env]) ||
    (kit.slug === 'gaming-room-build-kit' ? process.env.PUBLIC_STRIPE_KIT_URL : null) ||
    null;

  const row = {
    slug: kit.slug,
    name: kit.name,
    description: kit.description,
    price_gbp: kit.price_gbp,
    stripe_payment_link: stripeUrl,
    stripe_product_id: null,
    hero_image_url: kit.hero_image_url,
    kit_mockup_url: kit.kit_mockup_url,
    space_slug: kit.space_slug,
    sku: kit.sku,
    published: true,
    honest_take: kit.honest_take,
    review_summary: kit.review_summary,
    who_for: kit.who_for,
    who_not_for: kit.who_not_for,
    setup_notes: kit.setup_notes,
    tier_labels: kit.tier_labels,
    compare_hub_href: kit.compare_hub_href,
    updated_at: new Date().toISOString(),
  };

  console.log(`KIT ${kit.slug} stripe=${stripeUrl ? 'yes' : 'NO'} items=${kit.items.length}`);
  await sb('gvt_kits?on_conflict=slug', {
    method: 'POST',
    body: JSON.stringify(row),
  });

  // Replace items for idempotency
  await fetch(`${URL}/rest/v1/gvt_kit_items?kit_slug=eq.${encodeURIComponent(kit.slug)}`, {
    method: 'DELETE',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
  });

  const items = kit.items.map((it) => ({
    kit_slug: kit.slug,
    tier: it.tier,
    sort_order: it.sort_order,
    product_name: it.product_name,
    link_key: it.link_key,
    notes: it.notes,
    why_in_kit: it.why_in_kit,
    compare_href: it.compare_href,
    score_out_of_10: it.score_out_of_10,
    qty: 1,
  }));

  const out = await sb('gvt_kit_items', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(items),
  });
  console.log(`  items inserted: ${Array.isArray(out) ? out.length : items.length}`);
}

console.log('Kits seeded.');
