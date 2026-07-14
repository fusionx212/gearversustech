// Migration script: seed existing articles into Supabase
// Run: npx tsx supabase/seed-articles.ts

const SUPABASE_URL = 'https://zfinuyrubvqkexihgszz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const articles = [
  {
    slug: 'homey-pro-vs-aqara-hub-m3',
    title: 'Homey Pro vs Aqara Hub M3: Which Local Smart Home Hub Wins?',
    description: 'Eight protocols versus four. 50K devices versus 128. We determine which local-first hub earns your money.',
    category: 'smart-home',
    subcategory: 'Smart Home Hubs',
    winner_name: 'Homey Pro (2026 Edition)',
    winner_rating: 9.2,
    runnerup_name: 'Aqara Hub M3',
    runnerup_rating: 8.1,
    published: true,
    content_html: `<p>The choice between a <strong>Homey Pro</strong> and an <strong>Aqara Hub M3</strong> is not about which hub has more features on a spec sheet...</p>
    <span class="big5-label">The Big 5: 1 of 5</span>
    <h2>Cost and Price: What You Actually Pay</h2>
    <p>At retail, the numbers are straightforward. The <strong>Homey Pro (2026 Edition)</strong> costs <strong>349 pounds</strong> on Amazon UK. The <strong>Aqara Hub M3</strong> costs <strong>109 pounds</strong>. That is a 240-pound difference.</p>
    <p>But the purchase price tells only part of the story...</p>
    <div class="cta-group"><a href="https://www.amazon.co.uk/s?k=Homey+Pro+2026&tag=gearversustech-21" class="btn btn-amazon" rel="nofollow sponsored">Homey Pro on Amazon</a><a href="https://www.amazon.co.uk/s?k=Aqara+Hub+M3&tag=gearversustech-21" class="btn btn-amazon" rel="nofollow sponsored">Aqara Hub M3 on Amazon</a></div>
    <span class="big5-label">The Big 5: 2 of 5</span>
    <h2>Problems and Drawbacks</h2>
    <h3>Homey Pro: The Risks</h3>
    <p>The most common complaint is the <strong>learning curve</strong>...</p>
    <h3>Aqara Hub M3: The Risks</h3>
    <p>The M3 has a hard device ceiling of approximately <strong>128 connected devices</strong>...</p>
    <span class="big5-label">The Big 5: 3 of 5</span>
    <h2>Head-to-Head Comparison</h2>
    <div class="table-wrap"><table class="compare-table"><thead><tr><th>Specification</th><th>Homey Pro</th><th>Aqara Hub M3</th></tr></thead>
    <tbody><tr><td>Wireless Protocols</td><td class="win">8: Wi-Fi, Zigbee, Z-Wave Plus, BLE, 433MHz, Infrared, Matter, Thread</td><td>4: Wi-Fi, Zigbee, Matter, Thread</td></tr>
    <tr><td>Device Capacity</td><td class="win">50,000+</td><td>~128</td></tr>
    <tr><td>Z-Wave</td><td class="win">Full Z-Wave Plus</td><td>Not supported</td></tr>
    <tr><td>UK Price</td><td>349 pounds</td><td class="win">109 pounds</td></tr>
    <tr><td>Our Rating</td><td class="win">9.2/10</td><td>8.1/10</td></tr></tbody></table></div>
    <span class="big5-label">The Big 5: 4 of 5</span>
    <h2>Who Each Hub Is For</h2>
    <div class="prod-cards"><div class="prod-card winner"><h3>Homey Pro</h3><div class="price">349 pounds</div><div class="label good">Strengths</div><ul><li class="good">Eight wireless protocols</li><li class="good">50,000+ devices</li></ul><div class="label bad">Weaknesses</div><ul><li class="bad">349 pounds</li><li class="bad">Learning curve</li></ul><p><strong>Best for:</strong> Power users with 15+ multi-brand devices.</p><div class="cta-group"><a href="https://www.amazon.co.uk/s?k=Homey+Pro+2026&tag=gearversustech-21" class="btn btn-amazon" rel="nofollow sponsored">Check Price on Amazon</a></div></div>
    <div class="prod-card"><h3>Aqara Hub M3</h3><div class="price">109 pounds</div><div class="label good">Strengths</div><ul><li class="good">109 pounds value</li><li class="good">Native HomeKit</li></ul><div class="label bad">Weaknesses</div><ul><li class="bad">128-device limit</li><li class="bad">No Z-Wave</li></ul><p><strong>Best for:</strong> Apple HomeKit users on a budget.</p><div class="cta-group"><a href="https://www.amazon.co.uk/s?k=Aqara+Hub+M3&tag=gearversustech-21" class="btn btn-amazon" rel="nofollow sponsored">Check Price on Amazon</a></div></div></div>
    <span class="big5-label">The Big 5: 5 of 5</span>
    <div class="verdict"><h2>Best in Class</h2><p><strong>Buy Homey Pro if:</strong> You manage 15+ devices across multiple brands.</p><p><strong>Buy Aqara Hub M3 if:</strong> You use Apple HomeKit with under 30 devices.</p><p style="color:var(--green);font-weight:700;">The Homey Pro costs more today. It eliminates the need to ever replace your hub.</p></div>`
  },
  {
    slug: 'govee-gaming-lights-vs-philips-hue-play',
    title: 'Govee Gaming Light Kit vs Philips Hue Play: Best Smart RGB for Gaming Rooms',
    description: 'Govee G1 at 69 pounds vs Philips Hue Sync Box at 250 pounds. Side-by-side comparison covering cost, drawbacks, specs, and verdict.',
    category: 'smart-home',
    subcategory: 'Smart Lighting',
    winner_name: 'Govee Gaming Light Kit (G1)',
    winner_rating: 8.7,
    runnerup_name: 'Philips Hue Play Sync Box',
    runnerup_rating: 9.1,
    published: true,
    content_html: `<p>Smart ambient lighting transforms a gaming room from a desk with a monitor into an immersive environment...</p>
    <span class="big5-label">The Big 5: 1 of 5</span>
    <h2>Cost and Price</h2>
    <p>The <strong>Govee Gaming Light Kit (G1)</strong> costs <strong>69 pounds</strong> complete. The <strong>Philips Hue Play HDMI Sync Box</strong> costs <strong>250 pounds</strong> before you buy a single light...</p>
    <div class="price-row"><span class="label">Total functional setup</span><span class="value">69 / 400+ pounds</span></div>
    <span class="big5-label">The Big 5: 2 of 5</span>
    <h2>Problems and Drawbacks</h2>
    <h3>Govee G1 Trade-offs</h3><p>No native HDMI sync. PC relies on software capture.</p>
    <h3>Philips Hue Trade-offs</h3><p>250 pounds for the box alone. Locks you into the Hue ecosystem.</p>
    <span class="big5-label">The Big 5: 3 of 5</span>
    <h2>Head-to-Head Comparison</h2>
    <div class="table-wrap"><table class="compare-table"><thead><tr><th>Spec</th><th>Govee G1</th><th>Philips Hue Sync</th></tr></thead>
    <tbody><tr><td>Price</td><td class="win">69 pounds</td><td>250 pounds</td></tr>
    <tr><td>Sync method</td><td>Software/camera</td><td class="win">HDMI passthrough</td></tr>
    <tr><td>Matter/Thread</td><td>No</td><td class="win">Yes</td></tr>
    <tr><td>Setup time</td><td class="win">Under 10 min</td><td>30+ min</td></tr></tbody></table></div>
    <span class="big5-label">The Big 5: 5 of 5</span>
    <div class="verdict"><h2>Best in Class</h2><p><strong>Buy Govee G1 (69 pounds) if:</strong> You game on PC and want a complete kit in one box.</p><p><strong>Buy Philips Hue (250+ pounds) if:</strong> You game on console and need zero-latency HDMI sync.</p></div>`
  }
];

async function seed() {
  for (const article of articles) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gvt_articles?slug=eq.${article.slug}&select=id`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const existing = await res.json();
    
    if (existing.length > 0) {
      // Update
      await fetch(`${SUPABASE_URL}/rest/v1/gvt_articles?slug=eq.${article.slug}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(article)
      });
      console.log(`Updated: ${article.slug}`);
    } else {
      // Insert
      await fetch(`${SUPABASE_URL}/rest/v1/gvt_articles`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(article)
      });
      console.log(`Inserted: ${article.slug}`);
    }
  }
  console.log('Seed complete.');
}

seed().catch(console.error);
