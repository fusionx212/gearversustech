import { catalogueImage, getAffiliateLinksByKeys, getArticlesBySlugs, productKey } from './supabase';
import { STUDIO_RECOMMENDATIONS, type StudioRecommendation, type StudioSlotKey } from './studio-catalog';

let cached: { expires: number; value: Record<StudioSlotKey, StudioRecommendation> } | null = null;

export async function resolveStudioRecommendations() {
  if (cached && cached.expires > Date.now()) return cached.value;
  const entries = Object.entries(STUDIO_RECOMMENDATIONS) as [StudioSlotKey, StudioRecommendation][];
  const slugs = [...new Set(entries.map(([, item]) => item.compare.split('/').filter(Boolean).at(-1) || '').filter(Boolean))];
  const articles = await getArticlesBySlugs(slugs);
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  const winnerKeys = [...new Set(articles.map((article) => article.winner_name ? productKey(article.winner_name) : '').filter(Boolean))];
  const links = await getAffiliateLinksByKeys(winnerKeys);
  const byKey = new Map(links.map((link) => [link.link_key, link]));

  const value = Object.fromEntries(entries.map(([slot, fallback]) => {
    const slug = fallback.compare.split('/').filter(Boolean).at(-1) || '';
    const article = bySlug.get(slug);
    if (!article?.winner_name || article.winner_rating == null) return [slot, fallback];
    const key = productKey(article.winner_name); const link = byKey.get(key);
    const hasAffiliate = Boolean(link?.amazon_asin);
    return [slot, {
      ...fallback,
      pick: article.winner_name,
      source: article.title,
      comparisonScore: Number(article.winner_rating),
      image: catalogueImage(link?.link_key, link?.image_url) || fallback.image,
      buy: hasAffiliate ? `/c/amazon/${link!.link_key}` : fallback.compare,
      buyLabel: hasAffiliate ? 'Check live price ↗' : 'Open winning comparison →',
    } satisfies StudioRecommendation];
  })) as Record<StudioSlotKey, StudioRecommendation>;
  cached = { expires: Date.now() + 5 * 60 * 1000, value };
  return value;
}
