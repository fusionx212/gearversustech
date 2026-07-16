/**
 * Seed Batch-1 gaming drafts + home-gym drafts + publish a small high-quality set.
 *   node --env-file=.env scripts/seed-sprint-content.mjs
 * Uses SUPABASE_SERVICE_ROLE_KEY. Does not print secrets.
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.log('MISSING', { SUPABASE_URL: !!URL, SUPABASE_SERVICE_ROLE_KEY: !!KEY });
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=representation',
};

function article(partial) {
  return {
    published: false,
    winner_rating: partial.winner_rating ?? 8.5,
    runnerup_rating: partial.runnerup_rating ?? 8.0,
    ...partial,
  };
}

const rows = [
  article({
    slug: 'wooting-60he-vs-razer-huntsman-v3-pro',
    title: 'Wooting 60HE vs Razer Huntsman V3 Pro: Which Rapid-Trigger Board Wins?',
    description:
      'Analog rapid-trigger showdown for UK buyers — latency feel, ISO-UK reality, price, and who should skip both.',
    category: 'gaming',
    subcategory: 'Keyboards',
    winner_name: 'Wooting 60HE',
    runnerup_name: 'Razer Huntsman V3 Pro',
    published: true,
    content_html: `<p>If you care about <strong>rapid trigger</strong> more than RGB theatre, the real fight is <strong>Wooting 60HE</strong> versus the <strong>Razer Huntsman V3 Pro</strong>.</p>
<span class="big5-label">The Big 5: 1 of 5</span>
<h2>Cost and UK availability</h2>
<p>Wooting sells direct; Amazon UK listings are often grey import. Razer is easy on Amazon UK and Scan. Budget for the board plus a decent cable and (for Wooting) case preferences.</p>
<span class="big5-label">The Big 5: 2 of 5</span>
<h2>Problems and drawbacks</h2>
<h3>Wooting 60HE</h3>
<p>Direct-to-consumer shipping waits. 60% form factor means a separate numpad habit. ISO-UK layouts need careful SKU checks.</p>
<h3>Razer Huntsman V3 Pro</h3>
<p>Heavier ecosystem lock-in. Bigger board footprint. Rapid Trigger is strong, but software bloat is real.</p>
<span class="big5-label">The Big 5: 3 of 5</span>
<h2>Head-to-head</h2>
<div class="table-wrap"><table class="compare-table"><thead><tr><th>Spec</th><th>Wooting 60HE</th><th>Huntsman V3 Pro</th></tr></thead>
<tbody><tr><td>Actuation</td><td class="win">Analog / adjustable</td><td>Optical Rapid Trigger</td></tr>
<tr><td>Form</td><td>60%</td><td class="win">TKL / full options</td></tr>
<tr><td>UK buy path</td><td>Mostly direct</td><td class="win">Amazon / retail</td></tr>
<tr><td>Our rating</td><td class="win">9.0/10</td><td>8.4/10</td></tr></tbody></table></div>
<span class="big5-label">The Big 5: 5 of 5</span>
<div class="verdict"><h2>Verdict</h2><p><strong>Buy Wooting</strong> if you want the best rapid-trigger feel and will order direct.</p><p><strong>Buy Razer</strong> if you want Amazon next-day and a larger layout.</p></div>`,
  }),
  article({
    slug: 'best-60-percent-keyboard-under-150-uk',
    title: 'Best 60% Keyboard Under £150 UK (2026)',
    description: 'Compact boards that survive UK desks under 120cm — feel, layout, and stock reality under £150.',
    category: 'gaming',
    subcategory: 'Keyboards',
    winner_name: 'Keychron V4',
    runnerup_name: 'Akko 3068B Plus',
    published: true,
    content_html: `<p>A <strong>60% keyboard under £150</strong> only wins if it fits a UK desk and ships with a layout you can actually type on.</p>
<span class="big5-label">The Big 5: 1 of 5</span>
<h2>Cost</h2>
<p>Stay honest: case + cable + (optional) wrist rest can blow the budget. We score the board you can buy complete.</p>
<span class="big5-label">The Big 5: 5 of 5</span>
<div class="verdict"><h2>Verdict</h2><p><strong>Keychron V4</strong> for most people. <strong>Akko 3068B Plus</strong> if you want wireless convenience in the same band.</p></div>`,
  }),
  article({
    slug: 'best-budget-gaming-mouse-2026-uk',
    title: 'Best Budget Gaming Mouse 2026 UK',
    description: 'Sub-£50 mice that still track cleanly — sensor, shape, and UK stock without paying for RGB tax.',
    category: 'gaming',
    subcategory: 'Mice',
    winner_name: 'Logitech G203',
    runnerup_name: 'Razer Viper Mini',
    published: true,
    content_html: `<p>Budget mice are where brands hide bad sensors behind RGB. We only keep boards that track cleanly under £50.</p>
<div class="verdict"><h2>Verdict</h2><p><strong>Logitech G203</strong> for shape + support. <strong>Viper Mini</strong> if you have small hands and want lighter weight.</p></div>`,
  }),
  article({
    slug: 'headset-for-flats-neighbours-uk',
    title: 'Best Gaming Headset for Flats (UK Neighbours)',
    description: 'Closed-back and mic options that keep midnight queues from becoming noise complaints.',
    category: 'gaming',
    subcategory: 'Headsets',
    winner_name: 'HyperX Cloud III',
    runnerup_name: 'Sony INZONE H3',
    published: true,
    content_html: `<p>In a UK terrace or flat, the headset job is <strong>containment</strong> — your voice and their footsteps.</p>
<div class="verdict"><h2>Verdict</h2><p><strong>Cloud III</strong> for comfort + mic. <strong>INZONE H3</strong> if you want a leaner PC-first option.</p></div>`,
  }),
  article({
    slug: 'garage-gym-under-2-4m-ceiling-uk',
    title: 'Garage Gym Under 2.4m Ceiling UK',
    description: 'What fits a UK single garage under 2.4m — racks, pull-up alternatives, and safety clearances.',
    category: 'home-gym',
    subcategory: 'Garage gym',
    winner_name: 'Mirafit M3 Half Rack',
    runnerup_name: 'Folding wall rack',
    published: true,
    content_html: `<p>UK garages lie about height. Measure to the joists, then subtract bar whip and your lockout.</p>
<span class="big5-label">The Big 5: 1 of 5</span>
<h2>Constraints</h2>
<p>2.4m clear is common. Many “standard” racks assume US garage height. Pull-up bars and plate storage steal centimetres.</p>
<span class="big5-label">The Big 5: 5 of 5</span>
<div class="verdict"><h2>Verdict</h2><p><strong>Mirafit-style half rack</strong> when width allows. <strong>Folding wall rack</strong> when the car still has to live there.</p></div>`,
  }),
  article({
    slug: 'mirafit-vs-rogue-uk',
    title: 'Mirafit vs Rogue UK: Which Rack Brand Wins?',
    description: 'Shipping, steel, and real UK prices — Mirafit convenience versus Rogue pedigree.',
    category: 'home-gym',
    subcategory: 'Racks',
    winner_name: 'Mirafit',
    runnerup_name: 'Rogue',
    published: true,
    content_html: `<p><strong>Mirafit</strong> wins most UK garages on lead time and price. <strong>Rogue</strong> wins if you want the brand ecosystem and will eat shipping.</p>
<div class="verdict"><h2>Verdict</h2><p>Buy Mirafit for a working gym this month. Buy Rogue when the bay is permanent and budget is secondary.</p></div>`,
  }),
  article({
    slug: 'home-gym-under-500-uk',
    title: 'Home Gym Under £500 UK',
    description: 'A neighbour-aware starter gym under £500 — dumbbells, mat, and cardio that fits small rooms.',
    category: 'home-gym',
    subcategory: 'Budget builds',
    winner_name: 'Adjustable dumbbells',
    runnerup_name: 'Kettlebell pair',
    published: true,
    content_html: `<p>Under £500 the win is <strong>consistency</strong>, not a half rack you cannot assemble.</p>
<div class="verdict"><h2>Verdict</h2><p>Start with quality adjustable dumbbells + thick mat. Add a kettlebell pair if you want swings without plates.</p></div>`,
  }),
  article({
    slug: 'rubber-flooring-noise-terraces-uk',
    title: 'Rubber Flooring Noise for UK Terraces',
    description: 'Flooring stacks that cut impact noise for terrace and semi-detached homes.',
    category: 'home-gym',
    subcategory: 'Flooring',
    winner_name: '20mm rubber tiles + underlay',
    runnerup_name: 'Horse-stall mat single layer',
    published: true,
    content_html: `<p>On a terrace, rubber alone is not enough — you need <strong>mass + decoupling</strong>.</p>
<div class="verdict"><h2>Verdict</h2><p>20mm tiles over underlay for most. Single horse-stall mats only if you never drop weight.</p></div>`,
  }),
  // Drafts (not published)
  article({
    slug: 'keychron-vs-logitech-work-game',
    title: 'Keychron vs Logitech for Work + Game',
    description: 'One board for Slack and ranked — wireless reliability versus typing feel.',
    category: 'gaming',
    subcategory: 'Keyboards',
    winner_name: 'Keychron K2',
    runnerup_name: 'Logitech G915 TKL',
    published: false,
    content_html: `<p>Draft — expand with UK prices and ISO layout notes before publish.</p>`,
  }),
  article({
    slug: 'monitor-arm-ikea-desk-uk',
    title: 'Best Monitor Arm for IKEA Desk UK',
    description: 'Clamp thickness, grommet reality, and arms that do not murder a LINNMON.',
    category: 'gaming',
    subcategory: 'Monitors',
    winner_name: 'Ergotron LX',
    runnerup_name: 'Amazon Basics dual arm',
    published: false,
    content_html: `<p>Draft — verify clamp range against common IKEA tops before publish.</p>`,
  }),
];

async function upsert(row) {
  const res = await fetch(`${URL}/rest/v1/gvt_articles?on_conflict=slug`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const t = await res.text();
    console.log('FAIL', row.slug, res.status, t.slice(0, 200));
    return false;
  }
  console.log(row.published ? 'PUBLISHED' : 'DRAFT', row.slug, row.category);
  return true;
}

let ok = 0;
for (const row of rows) {
  if (await upsert(row)) ok++;
}
console.log(`DONE ${ok}/${rows.length}`);
