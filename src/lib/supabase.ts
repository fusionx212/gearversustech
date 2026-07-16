// Supabase client for Astro SSR
// Reads from env vars set in Netlify dashboard

const SUPABASE_URL = import.meta.env.SUPABASE_URL || 'https://zfinuyrubvqkexihgszz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || '';

export interface Article {
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

export interface AffiliateLink {
  link_key: string;
  product_name: string;
  amazon_asin: string | null;
  uk_price_gbp: number | null;
  image_url: string | null;
  score_out_of_10?: number | null;
  honest_take?: string | null;
  review_summary?: string | null;
  review_themes?: { theme: string; sentiment: string; note?: string }[] | null;
  buy_reasons?: string[] | null;
  usage_ideas?: string[] | null;
  drawbacks?: string[] | null;
  stats?: Record<string, string | number | boolean> | null;
  mockup_url?: string | null;
}

export interface GvtKit {
  slug: string;
  name: string;
  description: string;
  price_gbp: number;
  stripe_payment_link: string | null;
  hero_image_url: string | null;
  kit_mockup_url: string | null;
  space_slug: string | null;
  sku: string | null;
  honest_take: string | null;
  review_summary: string | null;
  who_for: string[] | null;
  who_not_for: string[] | null;
  setup_notes: string | null;
  tier_labels: { id: string; label: string; budget: string; blurb: string }[] | null;
  compare_hub_href: string | null;
}

export interface GvtKitItem {
  kit_slug: string;
  tier: string;
  sort_order: number;
  product_name: string;
  link_key: string | null;
  notes: string | null;
  why_in_kit: string | null;
  compare_href: string | null;
  score_out_of_10: number | null;
  qty: number;
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

/** Broken Amazon ASIN placeholder pattern (often HTTP 200 + ~43-byte GIF). */
function isBrokenAmazonImage(url: string | null | undefined): boolean {
  return !url || /images-eu\.ssl-images-amazon\.com\/images\/P\//i.test(url);
}

/** Category/subcategory fallbacks when a winner has no affiliate image (journey guides). */
const THUMB_FALLBACKS: Record<string, string> = {
  'garden-sheds': '/images/products/billyoh-petra-10x8-summer-house.webp',
  sheds: '/images/products/billyoh-pro-pent-hd-shed-8x6.webp',
  gaming: '/images/products/noblechairs-hero.webp',
  'smart-home': '/images/products/tp-link-tapo-p110.webp',
  'home-gym': '/images/kits/uk-garage-gym-build-kit.webp',
  best: '/images/products/billyoh-bella-8x8-summer-house.webp',
};

/** Prefer local packshots over broken Amazon CDN stubs (kits + compare thumbs). */
export function catalogueImage(
  linkKey: string | null | undefined,
  remote: string | null | undefined
): string | undefined {
  if (remote?.startsWith('/images/')) return remote;
  if (remote && !isBrokenAmazonImage(remote) && !linkKey) return remote;
  if (linkKey) {
    // Local-first for catalogue stability once we host the plate
    if (!remote || isBrokenAmazonImage(remote) || /^https?:\/\/(images-eu|m)\.media-amazon\.com/i.test(remote)) {
      return `/images/products/${linkKey}.webp`;
    }
    return remote;
  }
  return remote ?? undefined;
}

function resolveWinnerThumb(
  linkKey: string,
  imageUrl: string | null | undefined,
  category?: string | null,
  subcategory?: string | null
): string | undefined {
  const resolved = catalogueImage(linkKey || null, imageUrl);
  if (resolved) return resolved;
  return (
    (subcategory && THUMB_FALLBACKS[subcategory]) ||
    (category && THUMB_FALLBACKS[category]) ||
    undefined
  );
}

/** Batch-attach each article's winner product image (for card grids: homepage, category listings). */
export async function attachWinnerImages<
  T extends { winner_name: string | null; category?: string; subcategory?: string }
>(articles: T[]): Promise<(T & { winnerImage?: string })[]> {
  const keys = [...new Set(articles.map((a) => a.winner_name).filter(Boolean).map((n) => productKey(n as string)))];
  if (!keys.length) {
    return articles.map((a) => ({
      ...a,
      winnerImage: resolveWinnerThumb('', null, a.category, a.subcategory),
    }));
  }

  const rows = await supabaseQuery<AffiliateLink>('gvt_affiliate_links', {
    select: 'link_key,image_url',
    link_key: `in.(${keys.join(',')})`,
  });
  const byKey = new Map(rows.map((r) => [r.link_key, r.image_url]));

  return articles.map((a) => {
    const key = a.winner_name ? productKey(a.winner_name) : '';
    const fromDb = key ? byKey.get(key) : undefined;
    return {
      ...a,
      winnerImage: resolveWinnerThumb(key, fromDb, a.category, a.subcategory),
    };
  });
}

/** Extract all product names from article content_html (H3 headings inside the content body).
 *  Returns deduplicated list of product names that appear to be actual products (not section headers). */
export function extractProductNamesFromContent(contentHtml: string): string[] {
  const h3Regex = /<h3>([^<]+)<\/h3>/g;
  const names: string[] = [];
  let match;
  while ((match = h3Regex.exec(contentHtml)) !== null) {
    const name = match[1].trim();
    // Skip section headers that look like non-product headings
    if (/^(Best|Our|The|How|What|Why|When|Where|Which|Final|Verdict|Summary|Conclusion|FAQ)/i.test(name)) continue;
    if (name.length < 3 || name.length > 120) continue;
    names.push(name);
  }
  return [...new Set(names)];
}

/** Fetch affiliate links for all product names found in an article's content. */
export async function getComparedProducts(contentHtml: string, excludeNames: string[] = []): Promise<AffiliateLink[]> {
  const names = extractProductNamesFromContent(contentHtml);
  const filtered = names.filter((n) => !excludeNames.includes(n));
  if (!filtered.length) return [];

  const keys = filtered.map(productKey);
  return supabaseQuery<AffiliateLink>('gvt_affiliate_links', {
    select: '*',
    link_key: `in.(${keys.join(',')})`,
  });
}

export type ArticleCard = Pick<
  Article,
  'slug' | 'title' | 'description' | 'category' | 'subcategory' | 'winner_name' | 'winner_rating' | 'runnerup_name' | 'runnerup_rating' | 'created_at'
>;

/** Related compares: prefer same subcategory (any category), then same category. */
export async function getRelatedArticles(
  category: string,
  subcategory: string | null | undefined,
  excludeSlug: string,
  limit = 6
): Promise<ArticleCard[]> {
  const select =
    'slug,title,description,category,subcategory,winner_name,winner_rating,runnerup_name,runnerup_rating,created_at';

  let pool: ArticleCard[] = [];
  if (subcategory) {
    // Cross-category topical cluster (e.g. Gaming Keyboards in gaming + best)
    pool = await supabaseQuery<ArticleCard>('gvt_articles', {
      select,
      subcategory: `eq.${subcategory}`,
      published: 'eq.true',
      order: 'updated_at.desc',
      limit: String(limit + 4),
    });
  }

  const filtered = pool.filter((a) => a.slug !== excludeSlug);
  if (filtered.length >= limit) return filtered.slice(0, limit);

  const more = await supabaseQuery<ArticleCard>('gvt_articles', {
    select,
    category: `eq.${category}`,
    published: 'eq.true',
    order: 'updated_at.desc',
    limit: String(limit + 8),
  });

  const seen = new Set(filtered.map((a) => a.slug));
  for (const a of more) {
    if (a.slug === excludeSlug || seen.has(a.slug)) continue;
    filtered.push(a);
    seen.add(a.slug);
    if (filtered.length >= limit) break;
  }
  return filtered;
}

/** Group articles into subcategory clusters for category indexes. */
export function clusterBySubcategory<T extends { subcategory: string | null | undefined }>(
  articles: T[],
  fallback = 'More compares'
): { label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const a of articles) {
    const label = (a.subcategory || '').trim() || fallback;
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(a);
  }
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([label, items]) => ({ label, items }));
}

export async function getKits(): Promise<GvtKit[]> {
  return supabaseQuery<GvtKit>('gvt_kits', {
    select: '*',
    published: 'eq.true',
    order: 'price_gbp.asc',
  });
}

export async function getKit(slug: string): Promise<GvtKit | null> {
  const rows = await supabaseQuery<GvtKit>('gvt_kits', {
    select: '*',
    slug: `eq.${slug}`,
    published: 'eq.true',
    limit: '1',
  });
  return rows[0] || null;
}

export async function getKitItems(kitSlug: string): Promise<GvtKitItem[]> {
  return supabaseQuery<GvtKitItem>('gvt_kit_items', {
    select: '*',
    kit_slug: `eq.${kitSlug}`,
    order: 'sort_order.asc',
  });
}

/** Resolve kit line-items to affiliate rows (photos, enrichment). */
export async function attachKitItemProducts(
  items: GvtKitItem[]
): Promise<(GvtKitItem & { product?: AffiliateLink })[]> {
  const keys = [...new Set(items.map((i) => i.link_key).filter(Boolean))] as string[];
  if (!keys.length) return items.map((i) => ({ ...i }));
  const rows = await supabaseQuery<AffiliateLink>('gvt_affiliate_links', {
    select: '*',
    link_key: `in.(${keys.join(',')})`,
  });
  const byKey = new Map(rows.map((r) => [r.link_key, r]));
  return items.map((i) => ({
    ...i,
    product: i.link_key ? byKey.get(i.link_key) : undefined,
  }));
}
