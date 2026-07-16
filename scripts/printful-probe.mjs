/**
 * Read-only Printful store probe. Never prints API keys.
 *   node --env-file=.env scripts/printful-probe.mjs
 */
const key = process.env.PRINTFUL_API_KEY;
if (!key) {
  console.log('PRINTFUL_API_KEY=MISSING');
  process.exit(1);
}

const res = await fetch('https://api.printful.com/stores', {
  headers: { Authorization: `Bearer ${key}` },
});
const json = await res.json();
if (!res.ok) {
  console.log('FAIL', res.status, json?.error?.message || 'unknown');
  process.exit(1);
}
const stores = json.result || [];
console.log(
  'OK stores=',
  stores.length,
  stores.map((s) => ({ id: s.id, name: s.name, type: s.type }))
);

const prod = await fetch('https://api.printful.com/store/products', {
  headers: { Authorization: `Bearer ${key}` },
});
const prodJson = await prod.json();
if (!prod.ok) {
  console.log('PRODUCTS_FAIL', prod.status);
  process.exit(0);
}
const items = prodJson.result || [];
console.log(
  'products=',
  items.length,
  items.slice(0, 8).map((p) => ({ id: p.id, name: p.name, synced: p.synced }))
);
