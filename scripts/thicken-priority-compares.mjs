/**
 * Append substantive quality blocks to priority compare articles using
 * product enrichment (reviews, scores, usage). Idempotent via marker.
 *
 *   node --env-file=.env scripts/thicken-priority-compares.mjs
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MARKER = '<!--gvt-quality-v1-->';

const PRIORITY = [
  'wooting-60he-vs-razer-huntsman-v3-pro',
  'best-mechanical-keyboards-gaming-2026',
  'best-60-percent-keyboard-under-150-uk',
  'best-fps-mouse-uk-2026',
  'logitech-g502-vs-razer-basilisk',
  'best-27-inch-gaming-monitors-2026',
  'oled-vs-ips-gaming-monitor-uk',
  'best-gaming-headsets-under-100-pounds-2026',
  'headset-for-flats-neighbours-uk',
  'iso-uk-keyboard-buying-guide',
  'keychron-vs-logitech-work-game',
  'razer-huntsman-v3-pro-vs-steelseries-apex-pro-tkl',
  'best-wireless-gaming-mouse-under-80-uk',
  'best-1440p-gaming-monitor-under-400-uk',
  'renter-safe-smart-home-starter-uk',
];

async function sb(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function productBlock(p, role) {
  if (!p) return '';
  const themes = (p.review_themes || [])
    .map(
      (t) =>
        `<li><strong>${esc(t.theme)}</strong> (${esc(t.sentiment)})${t.note ? `: ${esc(t.note)}` : ''}</li>`
    )
    .join('');
  const buys = (p.buy_reasons || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const draws = (p.drawbacks || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const usage = (p.usage_ideas || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const stats = p.stats
    ? Object.entries(p.stats)
        .map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`)
        .join('')
    : '';
  const score = p.score_out_of_10 != null ? `${p.score_out_of_10}/10` : 'n/a';
  const mock = p.mockup_url
    ? `<figure class="gvt-mockup"><img src="${esc(p.mockup_url)}" alt="${esc(p.product_name)} in-room mockup" loading="lazy" width="800" height="500" /><figcaption>In-room mockup composited from the real Amazon product photo for ${esc(p.product_name)}.</figcaption></figure>`
    : '';

  return `
<section class="gvt-product-depth" data-role="${esc(role)}">
  <h2>${esc(p.product_name)} — ${esc(role)} (${esc(score)})</h2>
  ${mock}
  <h3>Why someone buys this one</h3>
  <p>${esc(p.honest_take)}</p>
  <h3>Review synthesis (UK-biased patterns)</h3>
  <p>${esc(p.review_summary)}</p>
  ${themes ? `<ul>${themes}</ul>` : ''}
  <h3>Measurable / practical stats</h3>
  ${stats ? `<table><thead><tr><th>Stat</th><th>Value</th></tr></thead><tbody>${stats}</tbody></table>` : '<p>See buy box for live UK price / ASIN.</p>'}
  <h3>Buy if…</h3>
  <ul>${buys}</ul>
  <h3>Skip if…</h3>
  <ul>${draws}</ul>
  <h3>Concrete usage ideas</h3>
  <ul>${usage}</ul>
</section>`;
}

const arts = await sb(
  `gvt_articles?select=slug,title,content_html,winner_name,runnerup_name,winner_rating,runnerup_rating&slug=in.(${PRIORITY.join(',')})`
);

const names = new Set();
for (const a of arts) {
  if (a.winner_name) names.add(a.winner_name);
  if (a.runnerup_name) names.add(a.runnerup_name);
}
const keys = [...names].map(slugify);
const products = keys.length
  ? await sb(
      `gvt_affiliate_links?select=*&link_key=in.(${keys.join(',')})`
    )
  : [];
const byKey = new Map(products.map((p) => [p.link_key, p]));

let updated = 0;
for (const a of arts) {
  let html = a.content_html || '';
  if (html.includes(MARKER)) {
    // replace previous quality block
    html = html.replace(
      new RegExp(`${MARKER}[\\s\\S]*?<!--/gvt-quality-v1-->`, 'g'),
      ''
    );
  }

  const w = a.winner_name ? byKey.get(slugify(a.winner_name)) : null;
  const r = a.runnerup_name ? byKey.get(slugify(a.runnerup_name)) : null;

  const block = `
${MARKER}
<hr />
<h2>Deep dive — scores, reviews, and who should buy which</h2>
<p>This section is grounded in measurable traits and recurring UK/EU review themes — not marketing fluff. Scores can be middling when the product only fits a niche.</p>
${productBlock(w, 'Our pick')}
${productBlock(r, 'Runner-up')}
<p><em>Grading note:</em> Gear Versus Tech scores performance 40%, value 25%, build 20%, ease of use 15%. A 7/10 can still be the right buy for a specific UK constraint (flat noise, ISO layout, renters).</p>
<!--/gvt-quality-v1-->
`;

  const next = `${html.trim()}\n${block}`;
  await sb(`gvt_articles?slug=eq.${encodeURIComponent(a.slug)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      content_html: next,
      updated_at: new Date().toISOString(),
    }),
  });
  console.log(
    `OK ${a.slug} len ${html.length}→${next.length} w=${w ? 'yes' : 'no'} r=${r ? 'yes' : 'no'}`
  );
  updated++;
}
console.log(`Thickened ${updated}/${PRIORITY.length} priority compares`);
