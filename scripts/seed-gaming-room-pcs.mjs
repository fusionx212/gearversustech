/**
 * Upsert gaming-room kit PCs + desks/monitors into gvt_affiliate_links,
 * then reseed kits from kits-catalog.json.
 *
 *   node --env-file=.env scripts/seed-gaming-room-pcs.mjs
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');

const asinImg = (asin) => `https://images-eu.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;

const PRODUCTS = [
  {
    link_key: 'scan-argen-rtx-4060-gaming-pc',
    product_name: 'SCAN Argen RTX 4060 Gaming PC (i5-12400F)',
    amazon_asin: 'B0CQPGFGT6',
    ebay_item_id: '375788037937',
    ebay_search: 'GTR Harbinger Gaming PC RTX 4060 12400F',
    uk_price_gbp: 650,
    score_out_of_10: 8.1,
    honest_take:
      'Honest starter tower: RTX 4060 + 16GB for 1080p/1440p medium–high. Prefers a known UK SI over mystery whitebox; still check street price vs Vibox twins.',
    review_summary:
      'Owners praise plug-and-play 1080p high settings and quiet-enough mesh cases; complaints cluster on 16GB ceilings for Chrome+Discord+AAA and PSU brand lottery on SI builds.',
    buy_reasons: ['Verified UK prebuilt with RTX 4060 class GPU', 'Fits Starter desk depth without full-size 4090 case drama'],
    drawbacks: ['16GB RAM is the ceiling for heavy multitasking', 'SI component lottery — confirm warranty terms'],
  },
  {
    link_key: 'stormforce-crystal-rtx-4070-ti-gaming-pc',
    product_name: 'Stormforce Crystal RTX 4070 Ti Gaming PC (i7-12700F)',
    amazon_asin: 'B0BXPZBN5T',
    ebay_item_id: '356474925200',
    ebay_search: 'PCSPECIALIST Flux 330 RTX 4070 gaming PC',
    uk_price_gbp: 1450,
    score_out_of_10: 8.5,
    honest_take:
      'Solid-tier 1440p workhorse. 4070 Ti class holds high refresh on a 27″ panel; Amazon exclusive Stormforce is the primary cart, eBay PCSPECIALIST is the priced alternative.',
    review_summary:
      'Buyers like 1440p high/ultra headroom and UK warranty paths; knocks are 16GB RAM on some SKUs and case thermals if intake filters clog.',
    buy_reasons: ['1440p high-refresh GPU class', 'Amazon UK listing with clear GPU naming'],
    drawbacks: ['Confirm RAM — some Crystal configs ship 16GB', 'Case RGB ≠ cooling; leave clearance'],
  },
  {
    link_key: 'cyberpowerpc-luxe-rtx-4080-super-gaming-pc',
    product_name: 'CyberPowerPC Luxe RTX 4080 Super Gaming PC (Ryzen 9 7900X)',
    amazon_asin: 'B073VL4XJQ',
    ebay_item_id: '116195634558',
    ebay_search: 'RTX 4080 Super gaming PC Ryzen 7800X3D',
    uk_price_gbp: 2200,
    score_out_of_10: 8.8,
    honest_take:
      'No-compromise GPU for QD-OLED 1440p/4K high. Amazon CyberPower Luxe is the decided cart; eBay custom 4080 Super builds are the price-check lane — verify seller feedback.',
    review_summary:
      'Praise: frame-time headroom with DLSS/RTX features and liquid-cooled CPU on Luxe configs. Complaints: heavy cases, loud stock fans under load, and ASIN/config churn on Amazon SI pages — always re-read the live GPU line.',
    buy_reasons: ['4080 Super class for OLED kit monitors', '32GB configs common at this tier'],
    drawbacks: ['ASIN configs churn — verify GPU on the live page', 'Overkill if you only play esports at 1080p'],
  },
  {
    link_key: 'aoc-27g2sp-gaming-monitor',
    product_name: 'AOC 27G2SP 27" 165Hz FHD Gaming Monitor',
    amazon_asin: 'B09WF7BDXV',
    ebay_item_id: null,
    ebay_search: 'AOC 27G2SP gaming monitor',
    uk_price_gbp: 130,
    score_out_of_10: 8.0,
    honest_take:
      'Starter panel: 27″ 1080p 165Hz IPS that matches RTX 4060 without OLED burn-in anxiety. Upgrade path is Alienware/QD-OLED in Solid+.',
    review_summary:
      'Praised for price-to-refresh and height stand; complaints about VA-vs-IPS taste and aging stock availability — check live title still says 27G2SP.',
    buy_reasons: ['Cheap high-refresh 27″ that fits UK desks', 'No OLED care tax at Starter'],
    drawbacks: ['1080p on 27″ shows pixels up close', 'Not the long-term endgame panel'],
  },
];

async function sb(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

const rows = PRODUCTS.map((p) => ({
  link_key: p.link_key,
  product_name: p.product_name,
  amazon_asin: p.amazon_asin,
  uk_price_gbp: p.uk_price_gbp,
  image_url: asinImg(p.amazon_asin),
  score_out_of_10: p.score_out_of_10,
  honest_take: p.honest_take,
  review_summary: p.review_summary,
  buy_reasons: p.buy_reasons,
  drawbacks: p.drawbacks,
  usage_ideas: ['Gaming room build kit tier PC/monitor'],
  stats: {
    ebay_item_id: p.ebay_item_id,
    ebay_search: p.ebay_search,
    kit: 'gaming-room-build-kit',
  },
  updated_at: new Date().toISOString(),
}));

const up = await sb('gvt_affiliate_links?on_conflict=link_key', {
  method: 'POST',
  body: JSON.stringify(rows),
});
console.log(`Upserted ${Array.isArray(up) ? up.length : rows.length} PC/monitor affiliate rows`);

// Enrich desks with ebay search keys (already seeded)
for (const desk of [
  {
    link_key: 'maidesite-standing-desk-120x60',
    ebay_search: 'MAIDeSITe standing desk 120x60',
  },
  {
    link_key: 'maidesite-standing-desk-140x70',
    ebay_search: 'MAIDeSITe standing desk 140x70',
  },
  {
    link_key: 'flexispot-e6-max-standing-desk-140x80',
    ebay_search: 'FLEXISPOT E6 MAX standing desk 140x80',
  },
]) {
  await sb(`gvt_affiliate_links?link_key=eq.${encodeURIComponent(desk.link_key)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      stats: { ebay_item_id: null, ebay_search: desk.ebay_search, structure_type: 'desk' },
    }),
  });
  console.log('desk ebay_search', desk.link_key);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const seed = spawnSync(process.execPath, ['--env-file=.env', join(__dirname, 'seed-kits.mjs')], {
  cwd: join(__dirname, '..'),
  stdio: 'inherit',
  shell: false,
});
if (seed.status !== 0) process.exit(seed.status ?? 1);
console.log('Gaming room PCs + kit items seeded.');
