/**
 * Create UK Garage Gym Build Kit (£19) Payment Link.
 *   node --env-file=.env scripts/create-stripe-garage-kit.mjs
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
console.log('account', acct.id);

const product = await stripe('products', {
  name: 'UK Garage Gym Build Kit',
  description:
    'UK garage gym shopping list: ceiling/noise constraints, 3 budget tiers, rack/flooring picks, decided cart. Digital delivery.',
  'metadata[site]': 'gearversustech',
  'metadata[sku]': 'gvt-garage-gym-kit',
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
  'after_completion[redirect][url]':
    'https://gearversustech.com/thank-you/?kit=garage-gym',
  'metadata[site]': 'gearversustech',
  'metadata[sku]': 'gvt-garage-gym-kit',
});
console.log('PAYMENT_LINK_URL', link.url);
console.log('Set PUBLIC_STRIPE_GARAGE_KIT_URL in Netlify + local .env');
