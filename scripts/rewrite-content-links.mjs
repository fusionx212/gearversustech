/**
 * Repoint the affiliate links baked into gvt_articles.content_html onto the /c/ rail.
 *
 * The links were written straight into the article HTML, so the retailer URL format
 * is frozen in the database — fixing the edge function alone changes nothing. This
 * rewrites each href to /c/<retailer>/<link_key>, after which the edge function owns
 * URL construction and every link is fixed in one place, permanently.
 *
 * Idempotent: hrefs already on /c/ are left alone.
 *
 *   node rewrite-content-links.mjs           # report only
 *   node rewrite-content-links.mjs --write
 */

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WRITE = process.argv.includes('--write');

const slugify = (s) =>
  s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function sb(path, init = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const links = await sb('gvt_affiliate_links?select=link_key,product_name');
const articles = await sb('gvt_articles?select=slug,content_html&published=eq.true');

/**
 * Resolve the search phrase inside an affiliate URL back to a known product.
 * Falls back to the slugified phrase: many links are generic category searches
 * ("video doorbell") with no product row, and those must still go through the rail
 * — the edge function keyword-searches them *with* tracking parameters attached,
 * which earns, whereas the current untracked link earns nothing.
 */
function resolveKey(phrase) {
  const s = slugify(decodeURIComponent(phrase.replace(/\+/g, ' ')));
  let best = null;
  for (const l of links) {
    if (s === l.link_key) return l.link_key;
    // The phrase usually carries extra words ("tp-link-tapo-p110-smart-plug").
    if (s.startsWith(l.link_key) || s.includes(l.link_key)) {
      if (!best || l.link_key.length > best.length) best = l.link_key;
    }
  }
  return best ?? s;
}

const AMAZON_RE = /https:\/\/www\.amazon\.co\.uk\/s\?k=([^"&]+)(?:&amp;|&)tag=[^"]*/g;
const EBAY_RE = /https:\/\/www\.ebay\.co\.uk\/sch\/i\.html\?_nkw=([^"&]+)(?:&amp;|&)campid=[^"]*/g;

let changed = 0;
let unresolved = 0;

for (const a of articles) {
  let html = a.content_html;
  const before = html;

  html = html.replace(AMAZON_RE, (m, phrase) => {
    const key = resolveKey(phrase);
    if (!key) { unresolved++; console.log(`  ? amazon unresolved in ${a.slug}: ${phrase}`); return m; }
    return `/c/amazon/${key}`;
  });

  html = html.replace(EBAY_RE, (m, phrase) => {
    const key = resolveKey(phrase);
    if (!key) { unresolved++; console.log(`  ? ebay unresolved in ${a.slug}: ${phrase}`); return m; }
    return `/c/ebay/${key}`;
  });

  if (html === before) continue;

  const amz = (html.match(/\/c\/amazon\//g) ?? []).length;
  const eby = (html.match(/\/c\/ebay\//g) ?? []).length;
  console.log(`  ${a.slug}  -> ${amz} amazon, ${eby} ebay`);
  changed++;

  if (WRITE) {
    await sb(`gvt_articles?slug=eq.${a.slug}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ content_html: html }),
    });
  }
}

console.log(`\n${changed} articles rewritten, ${unresolved} links unresolved`);
if (!WRITE) console.log('Dry run — nothing written. Re-run with --write.');
