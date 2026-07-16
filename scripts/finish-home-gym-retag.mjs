/**
 * Retag Home Gym spokes to category=home-gym (CHECK now allows it),
 * rewrite internal /best/compare/ gym URLs → /home-gym/compare/,
 * thicken thin published articles.
 *
 *   node --env-file=.env scripts/finish-home-gym-retag.mjs
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const h = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function sb(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...h, ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

const HOME_GYM_SLUGS = [
  'adjustable-dumbbells-uk-head-to-head',
  'best-rack-for-single-garage-uk',
  'garage-gym-under-2-4m-ceiling-uk',
  'home-gym-under-1000-uk',
  'home-gym-under-2500-uk',
  'home-gym-under-500-uk',
  'mirafit-vs-rogue-uk',
  'neighbour-friendly-cardio-uk',
  'rubber-flooring-noise-terraces-uk',
  'wall-mount-vs-freestanding-rack-uk',
];

const BEST_GYM_RE = /\/best\/compare\/(adjustable-dumbbells-uk-head-to-head|best-rack-for-single-garage-uk|garage-gym-under-2-4m-ceiling-uk|home-gym-under-1000-uk|home-gym-under-2500-uk|home-gym-under-500-uk|mirafit-vs-rogue-uk|neighbour-friendly-cardio-uk|rubber-flooring-noise-terraces-uk|wall-mount-vs-freestanding-rack-uk)\//g;

const THICKEN = {
  'mirafit-vs-rogue-uk': `<p><strong>Quick answer:</strong> <strong>Mirafit</strong> wins most UK garages on lead time, spare parts, and total landed cost. <strong>Rogue</strong> wins when the bay is permanent and you want the US brand ecosystem.</p>
<p>UK shipping and customs turn “same rack on paper” into a different buy. Measure bay width, door clearance, and ceiling to the joists before you order either path.</p>
<ul>
<li>Mirafit: faster UK delivery, easier returns, usually lower total cost</li>
<li>Rogue: premium ecosystem, longer wait / shipping friction for many UK orders</li>
<li>Neither fixes a 2.3m ceiling — pick a low-profile half rack or wall folder first</li>
</ul>
<p>See also <a href="/home-gym/compare/garage-gym-under-2-4m-ceiling-uk/">garage gym under 2.4m</a>, <a href="/home-gym/compare/best-rack-for-single-garage-uk/">best rack for a single garage</a>, and <a href="/home-gym/compare/home-gym-under-1000-uk/">home gym under £1,000</a>.</p>
<p><strong>Verdict:</strong> Buy Mirafit for a working gym this month. Buy Rogue when the bay is permanent and budget is not the bottleneck.</p>`,

  'rubber-flooring-noise-terraces-uk': `<p><strong>Quick answer:</strong> On a terrace, rubber alone is not enough — you need <strong>mass + decoupling</strong>. Prefer 20mm rubber tiles over a proper underlay; skip single horse-stall mats if downstairs neighbours can hear every drop.</p>
<p>Noise complaints kill home gyms faster than weak racks. Treat flooring as a system: underlay for decoupling, thick rubber for mass, and soft landings for dumbbells/kettlebells.</p>
<ul>
<li>Best default: 20mm interlocking tiles + underlay</li>
<li>Budget trap: thin mats that look “gym” but transmit impact</li>
<li>Cardio: put the noisiest machine on the thickest stack</li>
</ul>
<p>Pair with <a href="/home-gym/compare/neighbour-friendly-cardio-uk/">neighbour-friendly cardio</a> and <a href="/home-gym/compare/home-gym-under-500-uk/">under £500 starters</a>.</p>
<p><strong>Verdict:</strong> 20mm tiles over underlay for most UK terraces. Add a second layer only where you drop weights.</p>`,

  'garage-gym-under-2-4m-ceiling-uk': `<p><strong>Quick answer:</strong> UK garages lie about height. Measure to the joists, then subtract bar whip and lockout. Prefer a <strong>Mirafit-style half rack</strong> when width allows; a <strong>folding wall rack</strong> when the car still lives there.</p>
<p>Most “2.4m” garages lose space to lights, door tracks, and uneven concrete. Pull a tape at the exact spot the bar will travel.</p>
<ul>
<li>Half rack: better for squat/bench if the bay is dedicated</li>
<li>Wall folder: wins when you need the car back by evening</li>
<li>Skip tall pull-up towers if lockout already scrapes</li>
</ul>
<p>Related: <a href="/home-gym/compare/wall-mount-vs-freestanding-rack-uk/">wall-mount vs freestanding</a>, <a href="/home-gym/compare/mirafit-vs-rogue-uk/">Mirafit vs Rogue</a>, <a href="/spaces/garage-gym/">garage gym room hub</a>.</p>
<p><strong>Verdict:</strong> Half rack when width allows. Folding wall rack when the car still has to live there.</p>`,

  'home-gym-under-500-uk': `<p><strong>Quick answer:</strong> Under £500 the win is <strong>consistency</strong>, not a half rack you cannot assemble. Start with quality <strong>adjustable dumbbells</strong> plus a thick mat; add a kettlebell pair only if swings are in the plan.</p>
<p>A cheap rack that eats the budget leaves you with nowhere to train. Progressive load and joint-friendly flooring beat empty steel.</p>
<ul>
<li>Buy: adjustable dumbbells you will use 4×/week</li>
<li>Buy: thick mat / rubber for terrace noise</li>
<li>Defer: full rack until the habit sticks or budget hits £1k+</li>
</ul>
<p>Next steps: <a href="/home-gym/compare/adjustable-dumbbells-uk-head-to-head/">adjustable dumbbells head-to-head</a>, <a href="/home-gym/compare/home-gym-under-1000-uk/">under £1,000</a>, <a href="/home-gym/compare/rubber-flooring-noise-terraces-uk/">terrace flooring</a>.</p>
<p><strong>Verdict:</strong> Adjustable dumbbells + thick mat first. Rack later.</p>`,

  'headset-for-flats-neighbours-uk': `<p><strong>Quick answer:</strong> In a UK terrace or flat, the headset job is <strong>containment</strong> — your voice outbound and footsteps inbound. Pick <strong>HyperX Cloud III Wireless</strong> for all-day comfort and a mic neighbours will not hate; <strong>Sony INZONE H3</strong> if you want a leaner PC-first wired option.</p>
<p>Open-back audiophile cans leak. RGB party headsets boom. For shared walls, closed cups + a predictable mic matter more than virtual surround badges.</p>
<ul>
<li>Cloud III Wireless: comfort + mic reliability for long sessions</li>
<li>INZONE H3: lighter wired PC option when budget is tight</li>
<li>Skip open-backs in terraces unless you live alone</li>
</ul>
<p>Also see <a href="/gaming/compare/best-wireless-gaming-headset-under-150/">wireless headsets under £150</a> and <a href="/gaming/">gaming compares</a>.</p>
<p><strong>Verdict:</strong> Cloud III for comfort + mic. INZONE H3 if you want leaner PC-first.</p>`,

  'best-budget-gaming-mouse-2026-uk': `<p><strong>Quick answer:</strong> Budget mice hide bad sensors behind RGB. Keep boards that track cleanly under £50: <strong>Logitech G203</strong> for shape + UK support, <strong>Razer Viper Mini</strong> if you have small hands and want lighter weight.</p>
<p>If you can stretch toward flagship wireless sales, read <a href="/gaming/compare/logitech-superlight-2-vs-razer-viper-v3/">Superlight 2 vs Viper V3 Pro</a> — but do not force a £120 mouse into a £40 budget.</p>
<ul>
<li>G203: safe shape, easy replacement, solid sensor for the money</li>
<li>Viper Mini: lighter, better for small hands / fingertip</li>
<li>Ignore: ultra-cheap no-name sensors that spin out on dark pads</li>
</ul>
<p>Related: <a href="/gaming/compare/best-wireless-gaming-mouse-under-80-uk/">wireless under £80</a>, <a href="/gaming/compare/best-fps-mouse-uk-2026/">best FPS mouse</a>.</p>
<p><strong>Verdict:</strong> G203 for most. Viper Mini for small hands.</p>`,
};

// 1) Retag
for (const slug of HOME_GYM_SLUGS) {
  const out = await sb(`gvt_articles?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: JSON.stringify({ category: 'home-gym', subcategory: 'Home Gym' }),
  });
  console.log('RETAG', slug, out?.[0]?.category);
}

// 2) Rewrite internal links site-wide in published articles
const arts = await sb(
  'gvt_articles?select=slug,content_html&published=eq.true'
);
let linkFixes = 0;
for (const a of arts) {
  if (!a.content_html || !BEST_GYM_RE.test(a.content_html)) continue;
  BEST_GYM_RE.lastIndex = 0;
  const next = a.content_html.replace(BEST_GYM_RE, '/home-gym/compare/$1/');
  if (next === a.content_html) continue;
  await sb(`gvt_articles?slug=eq.${encodeURIComponent(a.slug)}`, {
    method: 'PATCH',
    body: JSON.stringify({ content_html: next }),
  });
  linkFixes++;
  console.log('LINKS', a.slug);
}

// 3) Thicken thin pages
for (const [slug, html] of Object.entries(THICKEN)) {
  await sb(`gvt_articles?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: JSON.stringify({ content_html: html }),
  });
  console.log('THICKEN', slug, 'len', html.length);
}

console.log('DONE retag', HOME_GYM_SLUGS.length, 'linkFixes', linkFixes, 'thicken', Object.keys(THICKEN).length);
