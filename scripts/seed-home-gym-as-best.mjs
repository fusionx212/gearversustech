/** Seed home-gym spokes as category=best until CHECK allows home-gym. */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
};

const rows = [
  {
    slug: 'garage-gym-under-2-4m-ceiling-uk',
    title: 'Garage Gym Under 2.4m Ceiling UK',
    description:
      'What fits a UK single garage under 2.4m — racks, pull-up alternatives, and safety clearances.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Mirafit M3 Half Rack',
    winner_rating: 8.6,
    runnerup_name: 'Folding wall rack',
    runnerup_rating: 8.1,
    published: true,
    content_html:
      '<p>UK garages lie about height. Measure to the joists, then subtract bar whip and your lockout.</p><div class="verdict"><h2>Verdict</h2><p><strong>Mirafit-style half rack</strong> when width allows. <strong>Folding wall rack</strong> when the car still has to live there.</p></div>',
  },
  {
    slug: 'mirafit-vs-rogue-uk',
    title: 'Mirafit vs Rogue UK: Which Rack Brand Wins?',
    description: 'Shipping, steel, and real UK prices — Mirafit convenience versus Rogue pedigree.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Mirafit',
    winner_rating: 8.7,
    runnerup_name: 'Rogue',
    runnerup_rating: 8.5,
    published: true,
    content_html:
      '<p><strong>Mirafit</strong> wins most UK garages on lead time and price. <strong>Rogue</strong> wins if you want the brand ecosystem and will eat shipping.</p><div class="verdict"><h2>Verdict</h2><p>Buy Mirafit for a working gym this month. Buy Rogue when the bay is permanent and budget is secondary.</p></div>',
  },
  {
    slug: 'home-gym-under-500-uk',
    title: 'Home Gym Under £500 UK',
    description:
      'A neighbour-aware starter gym under £500 — dumbbells, mat, and cardio that fits small rooms.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Adjustable dumbbells',
    winner_rating: 8.4,
    runnerup_name: 'Kettlebell pair',
    runnerup_rating: 8.0,
    published: true,
    content_html:
      '<p>Under £500 the win is <strong>consistency</strong>, not a half rack you cannot assemble.</p><div class="verdict"><h2>Verdict</h2><p>Start with quality adjustable dumbbells + thick mat.</p></div>',
  },
  {
    slug: 'rubber-flooring-noise-terraces-uk',
    title: 'Rubber Flooring Noise for UK Terraces',
    description: 'Flooring stacks that cut impact noise for terrace and semi-detached homes.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: '20mm rubber tiles + underlay',
    winner_rating: 8.8,
    runnerup_name: 'Horse-stall mat single layer',
    runnerup_rating: 7.6,
    published: true,
    content_html:
      '<p>On a terrace, rubber alone is not enough — you need <strong>mass + decoupling</strong>.</p><div class="verdict"><h2>Verdict</h2><p>20mm tiles over underlay for most.</p></div>',
  },
];

for (const row of rows) {
  const res = await fetch(`${URL}/rest/v1/gvt_articles?on_conflict=slug`, {
    method: 'POST',
    headers,
    body: JSON.stringify(row),
  });
  console.log(res.status, row.slug);
}
