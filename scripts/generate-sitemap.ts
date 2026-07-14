// Build-time sitemap generator — runs during `astro build`
// Queries Supabase and writes a static XML file to dist/
import { writeFileSync } from 'fs';

const SUPABASE_URL = 'https://zfinuyrubvqkexihgszz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

async function generate() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gvt_articles?select=slug,updated_at,category&published=eq.true&order=created_at.desc&limit=1000`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('Supabase query failed for sitemap');
    return;
  }

  const articles = await res.json() as { slug: string; updated_at: string; category: string }[];
  const urls = articles.map(
    (a) =>
      `  <url>
    <loc>https://gearversustech.com/${a.category}/compare/${a.slug}/</loc>
    <lastmod>${new Date(a.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  writeFileSync('public/sitemap-articles.xml', xml);
  console.log(`Sitemap generated: ${articles.length} articles`);
}

generate();
