import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://zfinuyrubvqkexihgszz.supabase.co';

export const GET: APIRoute = async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gvt_articles?select=slug,updated_at&published=eq.true&order=created_at.desc&limit=1000`,
    {
      headers: {
        apikey: import.meta.env.SUPABASE_ANON_KEY || '',
        Authorization: `Bearer ${import.meta.env.SUPABASE_ANON_KEY || ''}`,
      },
    }
  );

  if (!res.ok) {
    return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  const articles = await res.json();
  const urls = (articles as { slug: string; updated_at: string }[]).map(
    (a) =>
      `  <url>
    <loc>https://gearversustech.com/smart-home/compare/${a.slug}/</loc>
    <lastmod>${new Date(a.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
