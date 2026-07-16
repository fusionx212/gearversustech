import 'node:process';

const u = process.env.SUPABASE_URL;
const k = process.env.SUPABASE_ANON_KEY;
if (!u || !k) {
  console.log('MISSING', { SUPABASE_URL: !!u, SUPABASE_ANON_KEY: !!k });
  process.exit(1);
}

const res = await fetch(
  `${u}/rest/v1/gvt_articles?select=slug,category,published,winner_name&order=created_at.desc&limit=30`,
  { headers: { apikey: k, Authorization: `Bearer ${k}` } }
);
const data = await res.json();
if (!res.ok) {
  console.log('FAIL', res.status);
  process.exit(1);
}
console.log(
  'OK',
  data.length,
  JSON.stringify(
    data.map((x) => ({
      slug: x.slug,
      cat: x.category,
      pub: x.published,
      w: x.winner_name,
    }))
  )
);
