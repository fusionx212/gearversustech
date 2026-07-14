// Supabase client for Astro SSR
// Reads from env vars set in Netlify dashboard

const SUPABASE_URL = import.meta.env.SUPABASE_URL || 'https://zfinuyrubvqkexihgszz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || '';

interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  content_html: string;
  winner_name: string | null;
  winner_rating: number | null;
  runnerup_name: string | null;
  runnerup_rating: number | null;
  created_at: string;
  updated_at: string;
}

interface AffiliateLink {
  link_key: string;
  product_name: string;
  amazon_asin: string | null;
  uk_price_gbp: number | null;
  image_url: string | null;
}

const PARTNER_TAG = 'gearversustech-21';
const EBAY_CAMPID = '5339164583';

async function supabaseQuery<T>(table: string, query: Record<string, string>): Promise<T[]> {
  const params = new URLSearchParams(query);
  // Add select=* if not specified
  if (!params.has('select')) params.set('select', '*');

  const url = `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`Supabase query failed: ${res.status} ${res.statusText}`);
    return [];
  }

  return res.json();
}

export async function getArticle(slug: string): Promise<Article | null> {
  const articles = await supabaseQuery<Article>('gvt_articles', {
    select: '*',
    slug: `eq.${slug}`,
    published: 'eq.true',
    limit: '1',
  });
  return articles[0] || null;
}

export async function getArticlesByCategory(category: string, limit = 20): Promise<Article[]> {
  return supabaseQuery<Article>('gvt_articles', {
    select: 'slug,title,description,category,subcategory,winner_name,winner_rating,runnerup_name,runnerup_rating,created_at',
    category: `eq.${category}`,
    published: 'eq.true',
    order: 'created_at.desc',
    limit: String(limit),
  });
}

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  return supabaseQuery<Article>('gvt_articles', {
    select: 'slug,title,description,category,subcategory,winner_name,winner_rating,runnerup_name,runnerup_rating,created_at',
    published: 'eq.true',
    order: 'created_at.desc',
    limit: String(limit),
  });
}

export async function getAffiliateLink(key: string): Promise<AffiliateLink | null> {
  const links = await supabaseQuery<AffiliateLink>('gvt_affiliate_links', {
    select: '*',
    link_key: `eq.${key}`,
    limit: '1',
  });
  return links[0] || null;
}

export function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.co.uk/dp/${asin}?tag=${PARTNER_TAG}`;
}

export function buildEbayUrl(search: string): string {
  return `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(search)}&campid=${EBAY_CAMPID}`;
}

export function trackClick(retailer: string, productKey: string, articleSlug: string): void {
  // Fire-and-forget click tracking
  fetch(`${SUPABASE_URL}/rest/v1/gvt_clicks`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      retailer,
      product_key: productKey,
      article_slug: articleSlug,
    }),
  }).catch(() => {}); // Silent fail — click tracking must never block redirect
}

/** Product name -> gvt_affiliate_links.link_key. Must match the slugify in
 *  scripts/sync-amazon-products.mjs or lookups silently miss. */
export function productKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Resolve an article's winner and runner-up to their affiliate rows (image, price, ASIN). */
export async function getArticleProducts(article: {
  winner_name: string | null;
  runnerup_name: string | null;
}): Promise<{ winner?: AffiliateLink; runnerup?: AffiliateLink }> {
  const names = [article.winner_name, article.runnerup_name].filter(Boolean) as string[];
  if (!names.length) return {};

  const keys = names.map(productKey);
  const rows = await supabaseQuery<AffiliateLink>('gvt_affiliate_links', {
    select: '*',
    link_key: `in.(${keys.join(',')})`,
  });

  const byKey = new Map(rows.map((r) => [r.link_key, r]));
  return {
    winner: article.winner_name ? byKey.get(productKey(article.winner_name)) : undefined,
    runnerup: article.runnerup_name ? byKey.get(productKey(article.runnerup_name)) : undefined,
  };
}
