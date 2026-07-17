#!/usr/bin/env node
/**
 * Read-only catalogue freshness and completeness report.
 *
 * Run locally or from a scheduler. By default, freshness gaps are reported but
 * do not fail the job; use --strict when this is a release/publish gate.
 */

import { readFile } from 'node:fs/promises';

async function loadLocalEnv() {
  const raw = await readFile(new URL('../.env', import.meta.url), 'utf8').catch(() => '');
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

await loadLocalEnv();

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const STRICT = process.argv.includes('--strict');
const PRODUCT_MAX_AGE_DAYS = Number(process.env.GVT_PRODUCT_MAX_AGE_DAYS || 30);
const COMPARISON_MAX_AGE_DAYS = Number(process.env.GVT_COMPARISON_MAX_AGE_DAYS || 120);

if (!SB_URL || !SB_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are required.');
  process.exit(1);
}

async function sb(path) {
  const response = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  return response.json();
}

const normalise = (value = '') => value.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const slugify = (value = '') => normalise(value).replace(/\s+/g, '-');
const ageInDays = (value) => value ? Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000) : Infinity;

const [articles, products] = await Promise.all([
  sb('gvt_articles?select=slug,title,winner_name,runnerup_name,updated_at&published=eq.true&limit=5000'),
  // Select the live row shape so this audit survives older Supabase deployments
  // that do not yet include every retailer column documented in schema.sql.
  sb('gvt_affiliate_links?select=*&limit=5000'),
]);

const byName = new Map(products.map((product) => [normalise(product.product_name), product]));
const byKey = new Map(products.map((product) => [product.link_key, product]));
const resolveProduct = (name) => byName.get(normalise(name)) || byKey.get(slugify(name));
const findings = [];
const add = (severity, code, article, productName, detail) => findings.push({ severity, code, article: article.slug, product: productName, detail });

for (const article of articles) {
  const comparisonAge = ageInDays(article.updated_at);
  if (comparisonAge > COMPARISON_MAX_AGE_DAYS) {
    add('warning', 'comparison-stale', article, article.winner_name || '', `${comparisonAge} days since comparison update`);
  }

  for (const [role, productName] of [['winner', article.winner_name], ['runner-up', article.runnerup_name]]) {
    if (!productName || /depends|caveat|it depends/i.test(productName)) continue;
    const product = resolveProduct(productName);
    if (!product) {
      add('critical', 'product-missing', article, productName, `${role} has no catalogue record`);
      continue;
    }

    const productAge = ageInDays(product.updated_at);
    if (productAge > PRODUCT_MAX_AGE_DAYS) add('warning', 'product-stale', article, productName, `${productAge} days since product update`);
    if (!product.image_url) add('warning', 'image-missing', article, productName, `${role} has no product image`);
    if (!product.amazon_asin && !product.amazon_url && !product.ebay_url && !product.awin_url) {
      add('warning', 'buy-route-generic', article, productName, `${role} has no specific retailer destination`);
    }
    const reviewReady = product.score_out_of_10 != null && product.honest_take && product.review_summary;
    if (!reviewReady) add(role === 'winner' ? 'critical' : 'warning', 'review-incomplete', article, productName, `${role} cannot publish a complete standalone review`);
  }
}

const unique = [...new Map(findings.map((finding) => [JSON.stringify(finding), finding])).values()];
const critical = unique.filter((finding) => finding.severity === 'critical');
const warnings = unique.filter((finding) => finding.severity === 'warning');
const reviewed = products.filter((product) => product.score_out_of_10 != null && product.honest_take && product.review_summary).length;

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  thresholds: { productMaxAgeDays: PRODUCT_MAX_AGE_DAYS, comparisonMaxAgeDays: COMPARISON_MAX_AGE_DAYS },
  totals: { publishedComparisons: articles.length, catalogueProducts: products.length, reviewReadyProducts: reviewed, critical: critical.length, warnings: warnings.length },
  findings: unique,
}, null, 2));

if (critical.length || warnings.length) {
  console.error(`Catalogue health: ${critical.length} critical, ${warnings.length} warning.`);
} else {
  console.error('Catalogue health: all referenced products are current and review-ready.');
}

if (critical.length || (STRICT && warnings.length)) process.exitCode = 1;
