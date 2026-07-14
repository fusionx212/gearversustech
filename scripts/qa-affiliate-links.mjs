#!/usr/bin/env node
/**
 * Affiliate-link integrity guard for gearversustech.
 *
 * Catches the two failure modes found 2026-07-14: raw amazon.co.uk/ebay.co.uk
 * hrefs baked directly into content_html (bypasses click tracking, and in six
 * cases pointed at fabricated ASINs that don't resolve to any real product —
 * two of those resolved to a REAL but WRONG product, e.g. a Secretlab article
 * linking to a generic "Magic Life" office chair), and /c/ references that
 * point at a link_key with no real amazon_asin behind it.
 *
 * Run before publishing any article, or periodically as a sweep:
 *   node scripts/qa-affiliate-links.mjs
 * Exits non-zero if anything fails, so it can gate a publish step or a cron.
 */

const SB_URL = process.env.SUPABASE_URL ?? 'https://zfinuyrubvqkexihgszz.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SB_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set.');
  process.exit(1);
}

async function sb(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

const RAW_LINK_RE = /href="(https:\/\/www\.(amazon\.co\.uk|ebay\.co\.uk)\/[^"]*)"/g;
const TRACKED_LINK_RE = /\/c\/(amazon|ebay)\/([a-z0-9-]+)/g;

const articles = await sb('gvt_articles?select=slug,winner_name,runnerup_name,content_html&published=eq.true');
const links = await sb('gvt_affiliate_links?select=link_key,amazon_asin,product_name');
const byKey = new Map(links.map((l) => [l.link_key, l]));

let failures = 0;

for (const a of articles) {
  const raw = [...a.content_html.matchAll(RAW_LINK_RE)];
  for (const [, url] of raw) {
    console.error(`FAIL  ${a.slug}: raw untracked link in content_html -> ${url}`);
    failures++;
  }

  // A /c/ link with no matching link_key isn't broken -- the edge function falls
  // back to a live, tagged keyword search (see click-tracker.ts). Worth knowing
  // about (a specific product would convert better) but it's WARN, not FAIL.
  const tracked = new Set([...a.content_html.matchAll(TRACKED_LINK_RE)].map((m) => m[2]));
  for (const key of tracked) {
    const row = byKey.get(key);
    if (!row) {
      console.warn(`WARN  ${a.slug}: /c/.../${key} has no specific product -- falls back to keyword search`);
    } else if (!row.amazon_asin) {
      console.warn(`WARN  ${a.slug}: /c/.../${key} has no amazon_asin (eBay-only or unresolved)`);
    }
  }
}

console.log(`\n${articles.length} articles checked, ${failures} failure(s).`);
process.exit(failures > 0 ? 1 : 0);
