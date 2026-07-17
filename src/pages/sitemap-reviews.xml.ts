import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://zfinuyrubvqkexihgszz.supabase.co';

export const GET: APIRoute = async () => {
  const key = import.meta.env.SUPABASE_ANON_KEY || '';
  const response = await fetch(`${SUPABASE_URL}/rest/v1/gvt_affiliate_links?select=link_key,updated_at&review_summary=not.is.null&honest_take=not.is.null&score_out_of_10=not.is.null&order=updated_at.desc&limit=1000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  const rows = response.ok ? await response.json() as { link_key: string; updated_at: string }[] : [];
  const urls = rows.map((row) => `  <url>\n    <loc>https://gearversustech.com/reviews/${row.link_key}/</loc>\n    <lastmod>${new Date(row.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600' } });
};
