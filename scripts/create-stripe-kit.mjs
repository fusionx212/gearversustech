/**
 * Create GVT Gaming Room Build Kit product + Payment Link (£19).
 * Uses STRIPE_SECRET_KEY from env. Prints only id + url (no secret).
 *
 * WARNING: master.env Stripe key may belong to PolicyandPlay — verify account
 * before treating as production GVT revenue.
 *
 *   node --env-file=.env scripts/create-stripe-kit.mjs
 */
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.log('STRIPE_SECRET_KEY=MISSING');
  process.exit(1);
}

async function stripe(path, body) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

const acct = await fetch('https://api.stripe.com/v1/account', {
  headers: { Authorization: `Bearer ${key}` },
}).then((r) => r.json());
console.log('account', acct.id, acct.settings?.dashboard?.display_name || acct.business_profile?.name || '');

const product = await stripe('products', {
  name: 'Gaming Room Build Kit',
  description:
    'UK-verified gaming room shopping list: 3 budget tiers, layout notes, cable plan. Digital delivery.',
  'metadata[site]': 'gearversustech',
  'metadata[sku]': 'gvt-gaming-room-kit',
});
console.log('product', product.id);

const price = await stripe('prices', {
  product: product.id,
  unit_amount: '1900',
  currency: 'gbp',
});
console.log('price', price.id);

const link = await stripe('payment_links', {
  'line_items[0][price]': price.id,
  'line_items[0][quantity]': '1',
  'after_completion[type]': 'redirect',
  'after_completion[redirect][url]': 'https://gearversustech.com/thank-you/?kit=gaming',
  'metadata[site]': 'gearversustech',
});
console.log('PAYMENT_LINK_URL', link.url);
console.log('Set PUBLIC_STRIPE_KIT_URL to the URL above in Netlify + local .env');
