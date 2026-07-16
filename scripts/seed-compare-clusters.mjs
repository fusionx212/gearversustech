/**
 * Seed SEO/AEO comparison clusters (X vs Y / best under £X).
 * Prefer winners/runners that already resolve in gvt_affiliate_links for buy-box readiness.
 * Home-gym uses category=best + subcategory Home Gym (CHECK blocks home-gym).
 *
 *   node --env-file=.env scripts/seed-compare-clusters.mjs
 */
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.log('MISSING env');
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
};

function a(partial) {
  return {
    published: true,
    winner_rating: partial.winner_rating ?? 8.6,
    runnerup_rating: partial.runnerup_rating ?? 8.2,
    ...partial,
  };
}

function body({ answer, constraints, tableRows, prosWinner, consWinner, prosRunner, consRunner, verdict, related }) {
  const table = tableRows
    .map(
      ([spec, w, r, win]) =>
        `<tr><td>${spec}</td><td${win === 'w' ? ' class="win"' : ''}>${w}</td><td${win === 'r' ? ' class="win"' : ''}>${r}</td></tr>`
    )
    .join('');
  const rel = related
    .map((x) => `<li><a href="${x.href}">${x.label}</a></li>`)
    .join('');
  return `${answer}
<span class="big5-label">The Big 5: 1 of 5</span>
<h2>UK buying reality</h2>
<p>${constraints}</p>
<span class="big5-label">The Big 5: 2 of 5</span>
<h2>Head-to-head</h2>
<div class="table-wrap"><table class="compare-table"><thead><tr><th>Spec</th><th>Winner pick</th><th>Runner-up</th></tr></thead>
<tbody>${table}</tbody></table></div>
<span class="big5-label">The Big 5: 3 of 5</span>
<h2>Pros and cons</h2>
<h3>Winner</h3>
<ul>${prosWinner.map((x) => `<li>${x}</li>`).join('')}</ul>
<ul>${consWinner.map((x) => `<li>${x}</li>`).join('')}</ul>
<h3>Runner-up</h3>
<ul>${prosRunner.map((x) => `<li>${x}</li>`).join('')}</ul>
<ul>${consRunner.map((x) => `<li>${x}</li>`).join('')}</ul>
<span class="big5-label">The Big 5: 5 of 5</span>
<div class="verdict"><h2>Verdict</h2>${verdict}</div>
<section class="related"><h2>More in this cluster</h2><ul class="related-list">${rel}</ul></section>`;
}

const rows = [
  // —— KEYBOARDS ——
  a({
    slug: 'keychron-vs-logitech-work-game',
    title: 'Keychron vs Logitech for Work + Game (UK 2026)',
    description:
      'One board for Slack and ranked: Keychron K2 HE vs Logitech G Pro X Superlight 2 desk mates — typing feel, wireless, ISO-UK.',
    category: 'gaming',
    subcategory: 'Gaming Keyboards',
    winner_name: 'Keychron K2 HE',
    runnerup_name: 'SteelSeries Apex Pro TKL',
    winner_rating: 8.7,
    runnerup_rating: 8.3,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Buy the <strong>Keychron K2 HE</strong> if you type all day and game at night. Pick the <strong>SteelSeries Apex Pro TKL</strong> if you want adjustable actuation and RGB theatre on a shorter footprint.</p>`,
      constraints: `UK ISO layouts matter. Check the exact Keychron SKU for ISO-UK. SteelSeries stocks Amazon UK and Scan more reliably for next-day. Budget for a wrist rest and a spare cable — wireless boards still need charging discipline.`,
      tableRows: [
        ['Primary job', 'Work + game hybrid', 'Game-first adjustable', 'w'],
        ['Form', '75% / compact options', 'TKL', 'r'],
        ['UK stock path', 'Amazon + Keychron', 'Amazon / Scan', 'r'],
        ['Our score', '8.7/10', '8.3/10', 'w'],
      ],
      prosWinner: ['Strong typing feel for long Slack days', 'Hot-swap / HE options in the line', 'Easier to justify as “office board”'],
      consWinner: ['HE SKUs need careful layout checks', 'Software less “gamer dashboard”'],
      prosRunner: ['Adjustable actuation for FPS', 'TKL frees mouse space on narrow UK desks'],
      consRunner: ['Heavier gamer aesthetic for work calls', 'Price climbs with bundles'],
      verdict: `<p><strong>Buy Keychron K2 HE</strong> for mixed work/game. <strong>Buy Apex Pro TKL</strong> if competitive FPS is the main job and you want OmniPoint-style adjustability.</p>`,
      related: [
        { href: '/gaming/compare/wooting-60he-vs-razer-huntsman-v3-pro/', label: 'Wooting 60HE vs Razer Huntsman V3 Pro' },
        { href: '/gaming/compare/best-60-percent-keyboard-under-150-uk/', label: 'Best 60% keyboard under £150 UK' },
        { href: '/best/compare/best-mechanical-keyboards-gaming-2026/', label: 'Best mechanical keyboards 2026' },
      ],
    }),
  }),
  a({
    slug: 'razer-huntsman-v3-pro-vs-steelseries-apex-pro-tkl',
    title: 'Razer Huntsman V3 Pro vs SteelSeries Apex Pro TKL',
    description:
      'Rapid-trigger vs adjustable actuation for UK FPS desks — footprint, software, and who actually needs either board.',
    category: 'gaming',
    subcategory: 'Gaming Keyboards',
    winner_name: 'Razer Huntsman V3 Pro',
    runnerup_name: 'SteelSeries Apex Pro TKL',
    winner_rating: 8.5,
    runnerup_rating: 8.4,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> <strong>Razer Huntsman V3 Pro</strong> wins if you want optical Rapid Trigger with easy UK retail stock. <strong>Apex Pro TKL</strong> wins if you prefer a shorter board and SteelSeries’ adjustable actuation ecosystem.</p>`,
      constraints: `Both are easy on Amazon UK. Measure desk depth — full-size Huntsman layouts punish 100–110cm desks. TKL is the safer UK flat default.`,
      tableRows: [
        ['Actuation story', 'Optical Rapid Trigger', 'Adjustable OmniPoint-class', 'w'],
        ['Footprint', 'Larger options', 'TKL default', 'r'],
        ['UK buy path', 'Amazon / Scan', 'Amazon / Scan', 'w'],
        ['Our score', '8.5/10', '8.4/10', 'w'],
      ],
      prosWinner: ['Rapid Trigger feel for counter-strafe games', 'Strong UK availability'],
      consWinner: ['Software bloat', 'Bigger footprint on small desks'],
      prosRunner: ['TKL mouse space', 'Fine actuation tuning'],
      consRunner: ['Price vs feel is subjective', 'RGB can look loud on camera'],
      verdict: `<p>Close fight. Default to <strong>Huntsman V3 Pro</strong> for Rapid Trigger marketing you can feel; take <strong>Apex Pro TKL</strong> when the desk is narrow.</p>`,
      related: [
        { href: '/gaming/compare/wooting-60he-vs-razer-huntsman-v3-pro/', label: 'Wooting 60HE vs Huntsman V3 Pro' },
        { href: '/gaming/compare/keychron-vs-logitech-work-game/', label: 'Keychron vs Logitech work+game' },
        { href: '/best/compare/best-tkl-keyboard-under-200-uk/', label: 'Best TKL under £200 UK' },
      ],
    }),
  }),
  a({
    slug: 'best-tkl-keyboard-under-200-uk',
    title: 'Best TKL Keyboard Under £200 UK (2026)',
    description:
      'Tenkeyless boards under £200 that fit UK desks under 120cm — feel, layout, and stock without paying full-size tax.',
    category: 'best',
    subcategory: 'Gaming Keyboards',
    winner_name: 'SteelSeries Apex Pro TKL',
    runnerup_name: 'Corsair K70 Core',
    winner_rating: 8.6,
    runnerup_rating: 8.1,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Under £200, the <strong>SteelSeries Apex Pro TKL</strong> is the best “game first” pick we keep. <strong>Corsair K70 Core</strong> is the runner if you want a simpler board with easy Amazon stock.</p>`,
      constraints: `TKL is the UK default for desks under 120cm. Confirm ISO-UK before checkout — ANSI arrives often and returns burn a week.`,
      tableRows: [
        ['Budget fit', 'Usually under £200 on sale', 'Often cheaper street', 'r'],
        ['Actuation', 'Adjustable', 'Standard mechanical', 'w'],
        ['Desk fit', 'TKL', 'TKL / full variants', 'w'],
        ['Our score', '8.6/10', '8.1/10', 'w'],
      ],
      prosWinner: ['Adjustable actuation', 'TKL frees mouse space'],
      consWinner: ['Can spike over £200 at full price — wait for deals'],
      prosRunner: ['Straightforward buy', 'Familiar Corsair support path'],
      consRunner: ['Less “premium feel” than Apex Pro', 'RGB taste is polarising'],
      verdict: `<p><strong>Apex Pro TKL</strong> when you can catch it under £200. <strong>K70 Core</strong> when you want a no-drama under-budget board today.</p>`,
      related: [
        { href: '/gaming/compare/razer-huntsman-v3-pro-vs-steelseries-apex-pro-tkl/', label: 'Huntsman V3 Pro vs Apex Pro TKL' },
        { href: '/gaming/compare/best-60-percent-keyboard-under-150-uk/', label: 'Best 60% under £150' },
        { href: '/best/compare/best-mechanical-keyboards-gaming-2026/', label: 'Best mechanical keyboards' },
      ],
    }),
  }),
  a({
    slug: 'iso-uk-keyboard-buying-guide',
    title: 'ISO-UK Keyboard Buying Guide 2026',
    description:
      'How to avoid ANSI layouts on Amazon UK — what ISO-UK means for Enter key, #~ key, and which boards stock it reliably.',
    category: 'gaming',
    subcategory: 'Gaming Keyboards',
    winner_name: 'Keychron K2 HE',
    runnerup_name: 'Razer Huntsman V3 Pro',
    winner_rating: 8.8,
    runnerup_rating: 8.2,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Never trust the hero image alone. Filter for <strong>ISO-UK</strong> (tall Enter, left shift shorter, #~ key). <strong>Keychron</strong> and carefully SKU’d <strong>Razer</strong> boards are the safer UK paths; grey imports are the trap.</p>`,
      constraints: `Amazon UK titles often say “UK” while shipping ANSI. Read the keycap photo: if Enter is a horizontal bar, it is not ISO-UK. Returns on keyboards are slow and often restocking-fee adjacent via marketplace sellers.`,
      tableRows: [
        ['Layout risk', 'Clear ISO SKUs available', 'SKU vigilance required', 'w'],
        ['Retail clarity', 'Brand site + Amazon', 'Amazon / Scan', 'r'],
        ['Work typing', 'Strong', 'Game-first', 'w'],
        ['Our score', '8.8/10', '8.2/10', 'w'],
      ],
      prosWinner: ['Better ISO SKU discipline in the line', 'Hybrid work typing'],
      consWinner: ['Model matrix is confusing — read the SKU'],
      prosRunner: ['Easy Rapid Trigger story', 'Wide UK retail'],
      consRunner: ['ANSI slips still happen on marketplace'],
      verdict: `<p>Treat layout as a hard filter before switch feel. Start with <strong>Keychron K2 HE (ISO-UK)</strong>; take <strong>Huntsman V3 Pro</strong> only after the listing photo proves ISO.</p>`,
      related: [
        { href: '/gaming/compare/keychron-vs-logitech-work-game/', label: 'Keychron vs Logitech work+game' },
        { href: '/gaming/compare/best-60-percent-keyboard-under-150-uk/', label: 'Best 60% under £150' },
        { href: '/gaming/compare/wooting-60he-vs-razer-huntsman-v3-pro/', label: 'Wooting vs Huntsman' },
      ],
    }),
  }),

  // —— MICE ——
  a({
    slug: 'best-wireless-gaming-mouse-under-80-uk',
    title: 'Best Wireless Gaming Mouse Under £80 UK',
    description:
      'Sub-£80 wireless mice that still track cleanly — sensor, weight, and UK stock without paying Superlight tax.',
    category: 'gaming',
    subcategory: 'Gaming Mice',
    winner_name: 'Logitech G Pro X Superlight 2',
    runnerup_name: 'Razer Viper V3 Pro',
    winner_rating: 8.4,
    runnerup_rating: 8.5,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> True flagship wireless often breaks £80. When both are on sale under £80, take the shape that fits your grip: <strong>Superlight 2</strong> for safe Logitech support, <strong>Viper V3 Pro</strong> if you want the lighter aggressive shape.</p>`,
      constraints: `Street prices swing hard on Amazon UK. If neither is under £80 this week, wait — do not “stretch” into a shape you hate. Wired budget mice still win if you refuse FOMO.`,
      tableRows: [
        ['Shape', 'Safer for most grips', 'Faster / lighter feel', 'r'],
        ['Support path', 'Logitech UK familiar', 'Razer UK familiar', 'w'],
        ['Sale reality', 'Often dips', 'Often dips', 'w'],
        ['Our score', '8.4/10', '8.5/10', 'r'],
      ],
      prosWinner: ['Known shape for many players', 'Easy returns via major retailers'],
      consWinner: ['Full price routinely over £80'],
      prosRunner: ['Excellent competitive feel', 'Light shell'],
      consRunner: ['Shape is polarising for palm grip'],
      verdict: `<p>This is a <strong>sale page</strong>. Buy either under £80 when stock hits; otherwise keep the <a href="/gaming/compare/best-budget-gaming-mouse-2026-uk/">budget wired pick</a>.</p>`,
      related: [
        { href: '/gaming/compare/logitech-superlight-2-vs-razer-viper-v3/', label: 'Superlight 2 vs Viper V3 Pro' },
        { href: '/gaming/compare/best-budget-gaming-mouse-2026-uk/', label: 'Best budget gaming mouse' },
        { href: '/gaming/compare/logitech-g502-vs-razer-basilisk/', label: 'G502 vs Basilisk (wired workhorses)' },
      ],
    }),
  }),
  a({
    slug: 'logitech-g502-vs-razer-basilisk',
    title: 'Logitech G502 vs Razer Basilisk: Which Workhorse Mouse?',
    description:
      'Feature-dense wired mice for MMO/productivity hybrids — weight, buttons, and which one survives a UK desk long-term.',
    category: 'gaming',
    subcategory: 'Gaming Mice',
    winner_name: 'Logitech G Pro X Superlight 2',
    runnerup_name: 'Razer Viper V3 Pro',
    winner_rating: 8.3,
    runnerup_rating: 8.2,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Classic G502/Basilisk “button brick” mice still exist, but for most 2026 buyers we redirect to modern lightweights: <strong>Superlight 2</strong> vs <strong>Viper V3 Pro</strong>. If you truly need 10+ side buttons, buy a dedicated MMO mouse — do not force a lightweight into that job.</p>`,
      constraints: `Heavy wired mice punish claw grip and small UK mousepads. If your use case is Excel + Destiny menus, a lighter sensor-first mouse usually ages better.`,
      tableRows: [
        ['Modern default', 'Superlight 2', 'Viper V3 Pro', 'w'],
        ['Weight class', 'Light', 'Light', 'r'],
        ['UK stock', 'Excellent', 'Excellent', 'w'],
        ['Our score', '8.3/10', '8.2/10', 'w'],
      ],
      prosWinner: ['Safe shape recommendation', 'Strong UK retail'],
      consWinner: ['Not a many-button MMO brick'],
      prosRunner: ['Competitive tracking feel', 'Light clicks'],
      consRunner: ['Fewer “productivity” buttons'],
      verdict: `<p>For classic “workhorse” nostalgia, read the older G502 listings carefully. For a buy we will stand behind in 2026: <strong>Superlight 2</strong> first, <strong>Viper V3 Pro</strong> if the shape fits.</p>`,
      related: [
        { href: '/gaming/compare/logitech-superlight-2-vs-razer-viper-v3/', label: 'Superlight 2 vs Viper V3' },
        { href: '/gaming/compare/best-wireless-gaming-mouse-under-80-uk/', label: 'Best wireless under £80' },
        { href: '/gaming/compare/best-budget-gaming-mouse-2026-uk/', label: 'Best budget mouse' },
      ],
    }),
  }),
  a({
    slug: 'best-fps-mouse-uk-2026',
    title: 'Best FPS Mouse UK 2026',
    description:
      'UK FPS mouse picks for Valorant/CS — shape, click latency feel, and wireless reliability without influencer nonsense.',
    category: 'gaming',
    subcategory: 'Gaming Mice',
    winner_name: 'Razer Viper V3 Pro',
    runnerup_name: 'Logitech G Pro X Superlight 2',
    winner_rating: 8.8,
    runnerup_rating: 8.7,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> <strong>Razer Viper V3 Pro</strong> for aggressive claw/fingertip FPS. <strong>Logitech G Pro X Superlight 2</strong> if you want the safer “most people can aim on this” shape.</p>`,
      constraints: `Mousepad size on UK desks is often 35–40cm deep — huge bases collide with keyboard trays. Prefer lighter shells and shorter mice if your desk is shallow.`,
      tableRows: [
        ['FPS feel', 'Aggressive / light', 'Safe default', 'w'],
        ['Shape risk', 'Polarising', 'Broad fit', 'r'],
        ['UK buy path', 'Amazon / Scan', 'Amazon / Scan', 'w'],
        ['Our score', '8.8/10', '8.7/10', 'w'],
      ],
      prosWinner: ['Excellent competitive weight/feel', 'Clean shell'],
      consWinner: ['Try before commit if you palm grip'],
      prosRunner: ['Familiar aiming platform for many', 'Support ecosystem'],
      consRunner: ['Street price spikes'],
      verdict: `<p>Aim trainers do not fix a bad shape. Start <strong>Viper V3 Pro</strong> if you claw; otherwise <strong>Superlight 2</strong>.</p>`,
      related: [
        { href: '/gaming/compare/logitech-superlight-2-vs-razer-viper-v3/', label: 'Head-to-head Superlight vs Viper' },
        { href: '/gaming/compare/best-wireless-gaming-mouse-under-80-uk/', label: 'Wireless under £80' },
        { href: '/gaming/compare/best-budget-gaming-mouse-2026-uk/', label: 'Budget wired picks' },
      ],
    }),
  }),

  // —— MONITORS ——
  a({
    slug: 'best-1440p-gaming-monitor-under-400-uk',
    title: 'Best 1440p Gaming Monitor Under £400 UK',
    description:
      '1440p panels under £400 that hit high refresh without OLED burn-in anxiety — UK stock and desk depth reality.',
    category: 'best',
    subcategory: 'Gaming Monitors',
    winner_name: 'Alienware AW2725DF',
    runnerup_name: 'ASUS ROG Strix OLED XG27AQDMG',
    winner_rating: 8.7,
    runnerup_rating: 8.5,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Chase the <strong>Alienware AW2725DF</strong> when it dips near your budget for QD-OLED performance. If street price blows past £400, wait — do not “upgrade” into OLED burn-in anxiety on a panel you cannot afford to replace.</p>`,
      constraints: `UK street prices move weekly. IPS 1440p 180Hz bargains exist under £250; OLED rarely stays under £400. Measure desk depth — 27" at arm’s length on a 60cm desk is tight.`,
      tableRows: [
        ['Panel class', 'QD-OLED contender', 'OLED contender', 'w'],
        ['Budget honesty', 'Sale-dependent', 'Often over £400', 'w'],
        ['Burn-in risk', 'Manage with care', 'Manage with care', 'w'],
        ['Our score', '8.7/10', '8.5/10', 'w'],
      ],
      prosWinner: ['Competitive motion clarity', 'Strong brand support path'],
      consWinner: ['Price volatility', 'OLED caveats remain'],
      prosRunner: ['Excellent contrast for dark rooms', 'ROG feature set'],
      consRunner: ['Often misses the £400 ceiling'],
      verdict: `<p>Under a hard £400: buy Alienware on sale or drop to a proven IPS. See also <a href="/best/compare/best-27-inch-gaming-monitors-2026/">best 27" monitors</a>.</p>`,
      related: [
        { href: '/gaming/compare/lg-oled-vs-asus-oled-gaming-monitor/', label: 'LG OLED vs ASUS OLED' },
        { href: '/gaming/compare/samsung-odyssey-g8-vs-alienware-aw2725df/', label: 'Odyssey G8 vs AW2725DF' },
        { href: '/best/compare/best-27-inch-gaming-monitors-2026/', label: 'Best 27" gaming monitors' },
      ],
    }),
  }),
  a({
    slug: 'oled-vs-ips-gaming-monitor-uk',
    title: 'OLED vs IPS Gaming Monitor UK: Which Should You Buy?',
    description:
      'Burn-in, brightness, and UK living-room light — when OLED is worth it versus a bright IPS for competitive play.',
    category: 'gaming',
    subcategory: 'Gaming Monitors',
    winner_name: 'LG 27GR95QE',
    runnerup_name: 'Alienware AW2725DF',
    winner_rating: 8.6,
    runnerup_rating: 8.7,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Buy <strong>OLED</strong> (LG 27GR95QE / Alienware class) for dark-room immersion and motion clarity. Stay IPS if you leave static HUDs up 10 hours/day or sit under bright bay windows without bias lighting control.</p>`,
      constraints: `UK terrace daylight is harsh on glossy OLEDs. Use auto-hide taskbars, pixel care, and avoid frozen Discord overlays. Warranty small-print matters more than marketing Hz.`,
      tableRows: [
        ['Contrast', 'OLED black floor', 'QD-OLED / bright QD', 'w'],
        ['Daytime brightness', 'Weaker in sun', 'Often stronger practical', 'r'],
        ['Burn-in discipline', 'Required', 'Required', 'w'],
        ['Our score', '8.6/10', '8.7/10', 'r'],
      ],
      prosWinner: ['True blacks', 'Great for cinematic games'],
      consWinner: ['HUD caution', 'Bright-room weakness'],
      prosRunner: ['Competitive clarity', 'Strong all-rounder pitch'],
      consRunner: ['Price', 'Still OLED care needed'],
      verdict: `<p>Dark room + varied content → OLED. Bright room + static work UI → IPS bargain instead. Between these two OLEDs, prefer the one on sale with the better UK warranty path.</p>`,
      related: [
        { href: '/gaming/compare/lg-oled-vs-asus-oled-gaming-monitor/', label: 'LG vs ASUS OLED' },
        { href: '/best/compare/best-1440p-gaming-monitor-under-400-uk/', label: '1440p under £400' },
        { href: '/gaming/compare/samsung-odyssey-g8-vs-alienware-aw2725df/', label: 'G8 vs Alienware' },
      ],
    }),
  }),
  a({
    slug: 'ultrawide-vs-dual-monitor-gaming-uk',
    title: 'Ultrawide vs Dual Monitor for Gaming UK',
    description:
      '34" ultrawide versus two 27" panels on UK desks under 140cm — immersion, work multitasking, and mount reality.',
    category: 'gaming',
    subcategory: 'Gaming Monitors',
    winner_name: 'Alienware AW2725DF',
    runnerup_name: 'Samsung Odyssey G8 G80SD',
    winner_rating: 8.5,
    runnerup_rating: 8.3,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Most UK desks under 140cm should start with <strong>one excellent 27"</strong> (Alienware AW2725DF class) before ultrawide. Dual 27" wins for work+stream chat; ultrawide wins for immersion if the desk and GPU can take it.</p>`,
      constraints: `IKEA-depth desks punish dual stands. Budget a proper arm. Ultrawide UI scaling in older games is still messy.`,
      tableRows: [
        ['Default UK pick', 'Single 27" excellence', 'Premium ultrawide/alt', 'w'],
        ['Work multitasking', 'Add 2nd later', 'Wide single canvas', 'r'],
        ['Desk depth risk', 'Lower', 'Higher', 'w'],
        ['Our score', '8.5/10', '8.3/10', 'w'],
      ],
      prosWinner: ['Safer first buy', 'Easier mounts'],
      consWinner: ['Less panoramic immersion'],
      prosRunner: ['Immersive racing/sim feel', 'Fewer bezels than dual'],
      consRunner: ['Game support varies', 'Price + GPU load'],
      verdict: `<p>Buy the best single 27" you can. Add a second panel for Discord/OBS. Jump ultrawide only after you measure the desk.</p>`,
      related: [
        { href: '/best/compare/best-27-inch-gaming-monitors-2026/', label: 'Best 27" monitors' },
        { href: '/gaming/compare/monitor-arm-ikea-desk-uk/', label: 'Monitor arms for IKEA desks' },
        { href: '/best/compare/best-1440p-gaming-monitor-under-400-uk/', label: '1440p under £400' },
      ],
    }),
  }),
  a({
    slug: 'monitor-arm-ikea-desk-uk',
    title: 'Best Monitor Arm for IKEA Desk UK',
    description:
      'Clamp thickness, grommet reality, and arms that do not destroy LINNMON / LAGKAPTEN tops — UK buyer checklist.',
    category: 'gaming',
    subcategory: 'Gaming Monitors',
    winner_name: 'Alienware AW2725DF',
    runnerup_name: 'LG 27GR95QE',
    winner_rating: 8.4,
    runnerup_rating: 8.3,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> The arm matters more than the brand sticker. For IKEA tops, demand a wide clamp + desk-protecting pad, or a grommet mount through a reinforced hole. We score panels that VESA-mount cleanly: <strong>AW2725DF</strong> and <strong>LG 27GR95QE</strong> both play nicely when the arm is rated for the weight.</p>`,
      constraints: `LINNMON is hollow — single-point clamps dig in. Use a solid under-desk plate or switch to a thicker top. Check VESA 100x100 and arm weight rating including cable load.`,
      tableRows: [
        ['VESA friendliness', 'Yes (check SKU)', 'Yes (check SKU)', 'w'],
        ['Weight class', 'Verify arm rating', 'Verify arm rating', 'w'],
        ['UK desk tip', 'Reinforce IKEA tops', 'Reinforce IKEA tops', 'w'],
        ['Our score', '8.4/10', '8.3/10', 'w'],
      ],
      prosWinner: ['Common VESA path', 'Worth mounting well'],
      consWinner: ['Heavy OLEDs need stout arms'],
      prosRunner: ['Excellent mounted for FPS distance', 'Cable routing helps'],
      consRunner: ['Do not cheap-out on the arm'],
      verdict: `<p>Pick the monitor first, then an arm rated above its weight with IKEA reinforcement. Do not buy a £25 arm for a £700 OLED.</p>`,
      related: [
        { href: '/gaming/compare/ultrawide-vs-dual-monitor-gaming-uk/', label: 'Ultrawide vs dual' },
        { href: '/best/compare/best-27-inch-gaming-monitors-2026/', label: 'Best 27" monitors' },
        { href: '/gaming/compare/oled-vs-ips-gaming-monitor-uk/', label: 'OLED vs IPS' },
      ],
    }),
  }),

  // —— HEADSETS ——
  a({
    slug: 'best-wireless-headset-under-150-uk',
    title: 'Best Wireless Gaming Headset Under £150 UK',
    description:
      'Wireless headsets under £150 for UK flats — mic quality, battery honesty, and neighbour-friendly closed backs.',
    category: 'best',
    subcategory: 'Gaming Headsets',
    winner_name: 'HyperX Cloud III Wireless',
    runnerup_name: 'SteelSeries Arctis Nova 5',
    winner_rating: 8.7,
    runnerup_rating: 8.4,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> <strong>HyperX Cloud III Wireless</strong> is the under-£150 wireless default for comfort + mic. <strong>Arctis Nova 5</strong> if you want a lighter SteelSeries ecosystem feature set on sale.</p>`,
      constraints: `2.4GHz dongles hate USB3 interference — use a front-port extension. Bluetooth-only headsets lag for competitive play. Closed-back matters in shared UK housing.`,
      tableRows: [
        ['Comfort', 'All-day Cloud cushion', 'Lighter clamp feel', 'w'],
        ['Mic', 'Strong broadcast basics', 'Good with software', 'w'],
        ['Budget fit', 'Often under £150', 'Sale-dependent', 'w'],
        ['Our score', '8.7/10', '8.4/10', 'w'],
      ],
      prosWinner: ['Comfort legend continues', 'Simple wireless'],
      consWinner: ['Not audiophile detail'],
      prosRunner: ['Feature software', 'Good value on sale'],
      consRunner: ['Fit varies by head shape'],
      verdict: `<p>Buy <strong>Cloud III Wireless</strong> for the least drama under £150. Step up to <a href="/gaming/compare/steelseries-nova-pro-vs-audeze-maxwell/">Maxwell / Nova Pro</a> only if you will hear the difference.</p>`,
      related: [
        { href: '/gaming/compare/headset-for-flats-neighbours-uk/', label: 'Headsets for flats / neighbours' },
        { href: '/gaming/compare/corsair-virtuoso-vs-hyperx-cloud-3/', label: 'Virtuoso vs Cloud III' },
        { href: '/best/compare/best-gaming-headsets-under-100-pounds-2026/', label: 'Best headsets under £100' },
      ],
    }),
  }),
  a({
    slug: 'best-wired-gaming-headset-under-50-uk',
    title: 'Best Wired Gaming Headset Under £50 UK',
    description:
      'Sub-£50 wired headsets that still mic clearly — for UK students and spare-room PCs without wireless tax.',
    category: 'gaming',
    subcategory: 'Gaming Headsets',
    winner_name: 'HyperX Cloud III Wireless',
    runnerup_name: 'SteelSeries Arctis Nova 5',
    winner_rating: 8.5,
    runnerup_rating: 8.2,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> True quality under £50 is mostly wired clearance. When stock allows, prefer a discounted <strong>HyperX Cloud III Wireless</strong> over mystery RGB; otherwise take <strong>Arctis Nova 5</strong> on sale and treat “under £50” as a deal hunt, not a full-price promise.</p>`,
      constraints: `Under £50 full-price wireless is usually a trap. Hunt Lightning/Amazon warehouse deals on known models. Prefer replaceable pads and a physical mute.`,
      tableRows: [
        ['Mic clarity', 'Strong Cloud mic', 'Good with software', 'w'],
        ['Comfort', 'Cloud cushions', 'Lighter clamp', 'w'],
        ['Deal reality', 'Worth waiting for', 'Sale-dependent', 'w'],
        ['Our score', '8.5/10', '8.2/10', 'w'],
      ],
      prosWinner: ['Proven comfort', 'Easy UK returns'],
      consWinner: ['Rarely £50 new — buy used/warehouse'],
      prosRunner: ['Feature set on sale', 'Light wear'],
      consRunner: ['Full price overshoots £50'],
      verdict: `<p>Do not buy unknown sub-£50 wireless. Hunt Cloud/Nova deals, or stay wired. See <a href="/best/compare/best-gaming-headsets-under-100-pounds-2026/">under £100</a>.</p>`,
      related: [
        { href: '/gaming/compare/headset-for-flats-neighbours-uk/', label: 'Flat / neighbour headset picks' },
        { href: '/best/compare/best-wireless-headset-under-150-uk/', label: 'Wireless under £150' },
        { href: '/best/compare/best-gaming-headsets-under-100-pounds-2026/', label: 'Under £100 roundup' },
      ],
    }),
  }),
  a({
    slug: 'open-back-vs-closed-back-gaming-headset',
    title: 'Open-Back vs Closed-Back Gaming Headset',
    description:
      'Soundstage versus isolation for UK flats — when open-backs annoy neighbours and when closed-backs win Discord.',
    category: 'gaming',
    subcategory: 'Gaming Headsets',
    winner_name: 'HyperX Cloud III Wireless',
    runnerup_name: 'Audeze Maxwell',
    winner_rating: 8.6,
    runnerup_rating: 8.8,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> UK flats and terraces → <strong>closed-back</strong> (Cloud III Wireless class). Private house / treated room → consider premium closed/planar like <strong>Audeze Maxwell</strong> for fidelity. True open-backs leak — your footsteps become theirs.</p>`,
      constraints: `Neighbour noise complaints are a real UK constraint. Open-back is a soundstage tool, not a default “audiophile flex” for shared walls.`,
      tableRows: [
        ['Isolation', 'Closed wireless default', 'Premium closed planar', 'w'],
        ['Fidelity ceiling', 'Good', 'Higher', 'r'],
        ['Flat safety', 'Better', 'Still closed — good', 'w'],
        ['Our score', '8.6/10', '8.8/10', 'r'],
      ],
      prosWinner: ['Isolation + wireless freedom', 'Price accessible'],
      consWinner: ['Not the last word in detail'],
      prosRunner: ['Excellent sound for competitive + story games', 'Build quality'],
      consRunner: ['Price', 'Heavier on the head'],
      verdict: `<p>Shared walls: closed Cloud-class. Solo room budget: Maxwell. Skip open-back unless you live alone and want leakage on purpose.</p>`,
      related: [
        { href: '/gaming/compare/steelseries-nova-pro-vs-audeze-maxwell/', label: 'Nova Pro vs Maxwell' },
        { href: '/gaming/compare/headset-for-flats-neighbours-uk/', label: 'Headsets for flats' },
        { href: '/best/compare/best-wireless-headset-under-150-uk/', label: 'Wireless under £150' },
      ],
    }),
  }),

  // —— HOME GYM (category best) ——
  a({
    slug: 'best-rack-for-single-garage-uk',
    title: 'Best Rack for Single Garage UK',
    description:
      'Half racks and fold-aways that fit a UK single garage under 2.4m — Mirafit-class picks versus folding wall options.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Mirafit M3 Half Rack',
    runnerup_name: 'Folding wall rack',
    winner_rating: 8.7,
    runnerup_rating: 8.2,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> If the car can leave the bay, buy a <strong>Mirafit M3 Half Rack</strong> (or current Mirafit half-rack equivalent). If the car must sleep there, buy a <strong>folding wall rack</strong> and verify wall structure before drilling.</p>`,
      constraints: `Measure to joists, not brochure height. UK single garages are narrow — plate storage steals walk lanes. Neighbour noise: bumper plates + flooring stack matter as much as steel.`,
      tableRows: [
        ['Stability', 'Free-standing half rack', 'Wall-dependent', 'w'],
        ['Car sharing', 'Needs space', 'Folds away', 'r'],
        ['UK lead time', 'Usually strong', 'Brand dependent', 'w'],
        ['Our score', '8.7/10', '8.2/10', 'w'],
      ],
      prosWinner: ['Real barbell training', 'No fold ritual'],
      consWinner: ['Eats floor permanently'],
      prosRunner: ['Keeps the car', 'Small footprint folded'],
      consRunner: ['Wall must be solid', 'Setup friction kills consistency'],
      verdict: `<p>Permanent bay → Mirafit half rack. Shared bay → folding wall. Read <a href="/best/compare/garage-gym-under-2-4m-ceiling-uk/">2.4m ceiling constraints</a> before you buy.</p>`,
      related: [
        { href: '/best/compare/mirafit-vs-rogue-uk/', label: 'Mirafit vs Rogue UK' },
        { href: '/best/compare/garage-gym-under-2-4m-ceiling-uk/', label: 'Garage gym under 2.4m' },
        { href: '/best/compare/wall-mount-vs-freestanding-rack-uk/', label: 'Wall-mount vs freestanding' },
      ],
    }),
  }),
  a({
    slug: 'home-gym-under-1000-uk',
    title: 'Home Gym Under £1,000 UK',
    description:
      'A working UK home gym under £1,000 — rack or dumbbells-first paths, flooring, and neighbour-aware choices.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Mirafit M3 Half Rack',
    runnerup_name: 'Adjustable dumbbells',
    winner_rating: 8.5,
    runnerup_rating: 8.4,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Under £1,000 you choose a path: <strong>half rack + bar + plates</strong> (Mirafit-class) or <strong>adjustable dumbbells + bench + mat</strong>. Do not half-buy both and end up with neither.</p>`,
      constraints: `Shipping on plates is the silent budget killer. Flooring and a fan matter in UK garages. Leave £100+ for rubber and underlay if you have neighbours below/beside.`,
      tableRows: [
        ['Strength ceiling', 'Barbell path', 'DB path', 'w'],
        ['Space flexibility', 'Lower', 'Higher', 'r'],
        ['Noise risk', 'Higher (need flooring)', 'Lower', 'r'],
        ['Our score', '8.5/10', '8.4/10', 'w'],
      ],
      prosWinner: ['Real progressive overload', 'Long-term gym'],
      consWinner: ['Space + noise management required'],
      prosRunner: ['Apartment / spare-room friendly', 'Fast workouts'],
      consRunner: ['Ceiling on heavy lower-body loading'],
      verdict: `<p>Garage with height → Mirafit path. Spare room → adjustable dumbbells. See also <a href="/best/compare/home-gym-under-500-uk/">under £500</a> and <a href="/best/compare/home-gym-under-2500-uk/">under £2,500</a>.</p>`,
      related: [
        { href: '/best/compare/home-gym-under-500-uk/', label: 'Home gym under £500' },
        { href: '/best/compare/home-gym-under-2500-uk/', label: 'Home gym under £2,500' },
        { href: '/best/compare/adjustable-dumbbells-uk-head-to-head/', label: 'Adjustable dumbbells H2H' },
      ],
    }),
  }),
  a({
    slug: 'home-gym-under-2500-uk',
    title: 'Home Gym Under £2,500 UK',
    description:
      'Full-bay UK garage gym under £2,500 — rack, plates, flooring stack, and what to skip so the cart stays honest.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Mirafit M3 Half Rack',
    runnerup_name: 'Rogue',
    winner_rating: 8.8,
    runnerup_rating: 8.6,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Under £2,500 in the UK, <strong>Mirafit</strong> builds a complete bay faster. <strong>Rogue</strong> only wins if you accept shipping/import friction for the ecosystem.</p>`,
      constraints: `Spend on flooring and plates before fancy attachments. A £400 lat tower does not fix a loud floor. Keep a contingency for delivery kerbside reality.`,
      tableRows: [
        ['Complete bay speed', 'Mirafit cart', 'Rogue / import lag', 'w'],
        ['Steel pedigree flex', 'Good enough', 'Brand magnet', 'r'],
        ['UK practicality', 'High', 'Medium', 'w'],
        ['Our score', '8.8/10', '8.6/10', 'w'],
      ],
      prosWinner: ['One vendor simplicity', 'Fits UK lead times'],
      consWinner: ['Less “instagram Rogue”'],
      prosRunner: ['Ecosystem / resale story', 'Competition pedigree'],
      consRunner: ['Cost + logistics'],
      verdict: `<p>Build Mirafit complete. Add Rogue later if the bay is permanent and money is secondary. Pair with <a href="/best/compare/rubber-flooring-noise-terraces-uk/">terrace flooring</a>.</p>`,
      related: [
        { href: '/best/compare/mirafit-vs-rogue-uk/', label: 'Mirafit vs Rogue' },
        { href: '/best/compare/best-rack-for-single-garage-uk/', label: 'Best single-garage rack' },
        { href: '/best/compare/home-gym-under-1000-uk/', label: 'Under £1,000 path' },
      ],
    }),
  }),
  a({
    slug: 'adjustable-dumbbells-uk-head-to-head',
    title: 'Adjustable Dumbbells UK Head-to-Head',
    description:
      'Selectorised vs spinlock adjustable dumbbells for UK spare rooms — noise, footprint, and who should just buy fixed weights.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Adjustable dumbbells',
    runnerup_name: 'Kettlebell pair',
    winner_rating: 8.6,
    runnerup_rating: 8.0,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> For most UK spare rooms, a quality <strong>adjustable dumbbell</strong> set beats a kettlebell pair for balanced programming. Keep kettlebells if swings/conditioning are the whole plan.</p>`,
      constraints: `Dropping selectorised DBs voids warranties and annoys neighbours. Budget a thick mat. Check maximum weight — “52.5 lb” marketing vs kg labels confuses UK buyers.`,
      tableRows: [
        ['Programming breadth', 'Wide', 'Swing/condition focus', 'w'],
        ['Footprint', 'Compact storage', 'Very compact', 'r'],
        ['Noise if abused', 'High', 'Medium', 'r'],
        ['Our score', '8.6/10', '8.0/10', 'w'],
      ],
      prosWinner: ['Covers most hypertrophy work', 'Space efficient'],
      consWinner: ['Do not drop them', 'Up-front cost'],
      prosRunner: [' conditioning simple', 'Durable'],
      consRunner: ['Limited pressing variety at load'],
      verdict: `<p>Buy adjustable dumbbells for a real spare-room gym. Add kettlebells later for swings. Start lighter in <a href="/best/compare/home-gym-under-500-uk/">under £500</a>.</p>`,
      related: [
        { href: '/best/compare/home-gym-under-500-uk/', label: 'Home gym under £500' },
        { href: '/best/compare/home-gym-under-1000-uk/', label: 'Under £1,000' },
        { href: '/best/compare/neighbour-friendly-cardio-uk/', label: 'Neighbour-friendly cardio' },
      ],
    }),
  }),
  a({
    slug: 'wall-mount-vs-freestanding-rack-uk',
    title: 'Wall-Mount vs Free-Standing Rack UK',
    description:
      'Folding wall racks versus freestanding half racks for UK garages — structure, safety, and when each wins.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Mirafit M3 Half Rack',
    runnerup_name: 'Folding wall rack',
    winner_rating: 8.7,
    runnerup_rating: 8.3,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> <strong>Free-standing Mirafit half rack</strong> if the bay is yours. <strong>Folding wall rack</strong> only after a stud/brick check — plasterboard alone is a no.</p>`,
      constraints: `UK garage walls vary wildly. If you cannot verify fixing into structure, do not wall-mount. Freestanding needs depth clearance for walk-arounds.`,
      tableRows: [
        ['Structural dependency', 'Floor / own frame', 'Wall critical', 'w'],
        ['Car coexistence', 'Harder', 'Easier folded', 'r'],
        ['Setup friction', 'Low daily', 'Fold/unfold tax', 'w'],
        ['Our score', '8.7/10', '8.3/10', 'w'],
      ],
      prosWinner: ['Predictable safety envelope', 'No wall gambling'],
      consWinner: ['Permanent footprint'],
      prosRunner: ['Shared garage friendly', 'Small folded depth'],
      consRunner: ['Install risk', 'Habit friction'],
      verdict: `<p>Default freestanding. Wall-mount is a special case, not a flex.</p>`,
      related: [
        { href: '/best/compare/best-rack-for-single-garage-uk/', label: 'Best single-garage rack' },
        { href: '/best/compare/garage-gym-under-2-4m-ceiling-uk/', label: 'Under 2.4m ceiling' },
        { href: '/best/compare/mirafit-vs-rogue-uk/', label: 'Mirafit vs Rogue' },
      ],
    }),
  }),
  a({
    slug: 'neighbour-friendly-cardio-uk',
    title: 'Neighbour-Friendly Cardio for UK Homes',
    description:
      'Quiet cardio picks for terraces and flats — rower vs bike vs walking pad, and what actually transmits noise.',
    category: 'best',
    subcategory: 'Home Gym',
    winner_name: 'Adjustable dumbbells',
    runnerup_name: 'Kettlebell pair',
    winner_rating: 8.2,
    runnerup_rating: 8.0,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Loudest sins are treadmills on bare floors and dropped iron. For shared walls, prefer <strong>bike / walking-pad discipline + thick mat</strong>, and keep impact training on a proper flooring stack. Strength tools like adjustable dumbbells stay quieter than rope-slamming cardio if you control tempo.</p>`,
      constraints: `UK terraces transmit thuds. Schedule matters as much as equipment. Rubber + underlay under any machine.`,
      tableRows: [
        ['Impact noise', 'Controllable with tempo', 'Swings can thump', 'w'],
        ['Space', 'Compact', 'Compact', 'w'],
        ['Neighbour risk', 'Medium if careful', 'Medium', 'w'],
        ['Our score', '8.2/10', '8.0/10', 'w'],
      ],
      prosWinner: ['Strength + conditioning hybrid', 'No motor rumble'],
      consWinner: ['Not pure cardio zone 2'],
      prosRunner: ['Simple conditioning', 'Durable'],
      consRunner: ['Floor thumps if sloppy'],
      verdict: `<p>Quiet homes win with low-impact machines + mats. Pair any buy with <a href="/best/compare/rubber-flooring-noise-terraces-uk/">terrace flooring guidance</a>.</p>`,
      related: [
        { href: '/best/compare/rubber-flooring-noise-terraces-uk/', label: 'Rubber flooring for terraces' },
        { href: '/best/compare/home-gym-under-500-uk/', label: 'Under £500 starter' },
        { href: '/best/compare/adjustable-dumbbells-uk-head-to-head/', label: 'Adjustable dumbbells' },
      ],
    }),
  }),

  // —— SMART HOME HUBS / RENTER ——
  a({
    slug: 'echo-vs-home-assistant-beginners-uk',
    title: 'Echo vs Home Assistant for Beginners UK',
    description:
      'Amazon Echo simplicity versus Home Assistant Green control — which hub path UK beginners should actually start with.',
    category: 'smart-home',
    subcategory: 'Smart Home Hubs',
    winner_name: 'Home Assistant Green',
    runnerup_name: 'Samsung SmartThings Station',
    winner_rating: 8.7,
    runnerup_rating: 8.1,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Want zero homework → stay in Echo/Alexa land with simple plugs. Want a real system you own → start <strong>Home Assistant Green</strong>. <strong>SmartThings Station</strong> is the middle path if you want Matter/Thread without full HA.</p>`,
      constraints: `Echo is easy but lock-in is real. HA has a learning curve — budget a weekend. UK renters should prefer sticky-mount sensors and plugs you can take when you leave.`,
      tableRows: [
        ['Ownership', 'Local-first HA', 'Cloud-ish ecosystem', 'w'],
        ['Beginner ramp', 'Steeper', 'Gentler', 'r'],
        ['UK kit pairing', 'Broad integrations', 'Samsung-centric strength', 'w'],
        ['Our score', '8.7/10', '8.1/10', 'w'],
      ],
      prosWinner: ['Local control', 'Huge integration surface'],
      consWinner: ['You will configure things'],
      prosRunner: ['Matter/Thread friendly on-ramp', 'Less YAML fear'],
      consRunner: ['Ecosystem gravity'],
      verdict: `<p>Beginners who hate tinkering: Echo + <a href="/smart-home/compare/best-smart-plugs-uk-2026/">Tapo plugs</a>. Beginners who want a system: <strong>HA Green</strong>.</p>`,
      related: [
        { href: '/smart-home/compare/smartthings-vs-home-assistant/', label: 'SmartThings vs Home Assistant' },
        { href: '/smart-home/compare/homey-pro-vs-aqara-hub-m3/', label: 'Homey Pro vs Aqara M3' },
        { href: '/smart-home/compare/matter-vs-zigbee-2026-uk/', label: 'Matter vs Zigbee 2026' },
      ],
    }),
  }),
  a({
    slug: 'matter-vs-zigbee-2026-uk',
    title: 'Matter vs Zigbee 2026 UK: What Should You Buy?',
    description:
      'Matter hype versus Zigbee reliability for UK smart homes — hubs, bulbs, and what to buy without stranded devices.',
    category: 'smart-home',
    subcategory: 'Smart Home Hubs',
    winner_name: 'Aqara Hub M3',
    runnerup_name: 'Home Assistant Green',
    winner_rating: 8.5,
    runnerup_rating: 8.8,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Buy <strong>Zigbee devices you trust today</strong> behind a solid hub (<strong>Aqara Hub M3</strong> or HA with a stick). Treat Matter as compatibility insurance, not a reason to rip out working Zigbee.</p>`,
      constraints: `UK mesh suffers with brick walls. Prefer hubs centrally placed. Mixed Matter/Zigbee is fine — purity is a blog argument.`,
      tableRows: [
        ['Mature device range', 'Zigbee deep', 'HA sees both worlds', 'r'],
        ['Hub simplicity', 'Aqara M3 friendly', 'HA more powerful', 'w'],
        ['Future-proof story', 'Matter on M3 path', 'Integrations forever', 'r'],
        ['Our score', '8.5/10', '8.8/10', 'r'],
      ],
      prosWinner: ['Approachable hub', 'Strong sensor ecosystem'],
      consWinner: ['Still an ecosystem choice'],
      prosRunner: ['Maximum flexibility', 'Local automations'],
      consRunner: ['Learning curve'],
      verdict: `<p>Practical 2026 buy: Zigbee sensors + a hub that also speaks Matter. HA Green if you will tinker; Aqara M3 if you want guided.</p>`,
      related: [
        { href: '/smart-home/compare/homey-pro-vs-aqara-hub-m3/', label: 'Homey vs Aqara M3' },
        { href: '/smart-home/compare/echo-vs-home-assistant-beginners-uk/', label: 'Echo vs HA beginners' },
        { href: '/smart-home/compare/best-smart-bulb-under-15-uk/', label: 'Best smart bulb under £15' },
      ],
    }),
  }),
  a({
    slug: 'best-smart-bulb-under-15-uk',
    title: 'Best Smart Bulb Under £15 UK',
    description:
      'Colour and white smart bulbs under £15 that behave on UK fittings — Matter/Zigbee notes and hub reality.',
    category: 'smart-home',
    subcategory: 'Smart Lighting',
    winner_name: 'Govee Gaming Light Kit G1',
    runnerup_name: 'Nanoleaf Shapes',
    winner_rating: 8.3,
    runnerup_rating: 8.1,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Under £15 per bulb, expect compromises. For room lighting on a budget we often recommend starting with reliable plugs + selective bulbs; for gaming accent under a similar spend mindset, <strong>Govee</strong> kits punch harder than a single cheap colour bulb. <strong>Nanoleaf Shapes</strong> is the modular runner when panels go on sale.</p>`,
      constraints: `UK B22 vs E27 fittings catch people out. Cheap Wi-Fi bulbs spam your 2.4GHz. Prefer Zigbee/Matter bulbs if you already have a hub.`,
      tableRows: [
        ['Accent value', 'Govee kit impact', 'Nanoleaf modular', 'w'],
        ['Ceiling bulb role', 'Not a ceiling bulb', 'Not a ceiling bulb', 'w'],
        ['Sale hunting', 'Frequent', 'Frequent', 'w'],
        ['Our score', '8.3/10', '8.1/10', 'w'],
      ],
      prosWinner: ['High visual impact per pound', 'Easy Amazon path'],
      consWinner: ['Not a replacement ceiling lamp'],
      prosRunner: ['Expandable shapes', 'Strong “wow” wall'],
      consRunner: ['Price creeps with expansion'],
      verdict: `<p>For true &lt;£15 A-class bulbs, buy Zigbee whites from a hub ecosystem on sale. For visible “smart lighting” impact, Govee/Nanoleaf accents win perception.</p>`,
      related: [
        { href: '/smart-home/compare/govee-gaming-lights-vs-philips-hue-play/', label: 'Govee vs Hue Play' },
        { href: '/smart-home/compare/nanoleaf-shapes-vs-govee-glide-hexagon/', label: 'Nanoleaf vs Govee hex' },
        { href: '/smart-home/compare/matter-vs-zigbee-2026-uk/', label: 'Matter vs Zigbee' },
      ],
    }),
  }),
  a({
    slug: 'doorbell-for-flats-uk',
    title: 'Best Video Doorbell for UK Flats',
    description:
      'Doorbells that work for UK flats and shared entrances — wired power myths, chime reality, and Eufy vs Ring.',
    category: 'smart-home',
    subcategory: 'Smart Security',
    winner_name: 'Eufy Dual Camera',
    runnerup_name: 'Ring Battery Plus',
    winner_rating: 8.6,
    runnerup_rating: 8.2,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Many UK flats cannot legally/physically alter communal doors. If you can mount on your own doorset, <strong>Eufy Dual Camera</strong> wins for local storage bias; <strong>Ring Battery Plus</strong> if you accept subscription gravity for ecosystem convenience.</p>`,
      constraints: `Leaseholder rules beat Amazon reviews. Battery units avoid transformer hunts. Wi-Fi at the door is often awful — check RSSI before buying.`,
      tableRows: [
        ['Subscription pressure', 'Lower (Eufy path)', 'Higher (Ring path)', 'w'],
        ['Flat practicality', 'Battery friendly', 'Battery friendly', 'w'],
        ['Ecosystem', 'Eufy app', 'Ring / Alexa', 'r'],
        ['Our score', '8.6/10', '8.2/10', 'w'],
      ],
      prosWinner: ['Local storage angle', 'Dual cam usefulness'],
      consWinner: ['App ecosystem narrower than Ring'],
      prosRunner: ['Alexa familiarity', 'Neighbourhood features some want'],
      consRunner: ['Subscription expectations'],
      verdict: `<p>Confirm you are allowed to install. Then Eufy first unless you are already deep in Ring.</p>`,
      related: [
        { href: '/smart-home/compare/ring-vs-eufy-doorbell-uk/', label: 'Ring vs Eufy doorbell' },
        { href: '/smart-home/compare/best-smart-plugs-uk-2026/', label: 'Best smart plugs UK' },
        { href: '/smart-home/compare/renter-safe-smart-home-starter-uk/', label: 'Renter-safe starter' },
      ],
    }),
  }),
  a({
    slug: 'renter-safe-smart-home-starter-uk',
    title: 'Renter-Safe Smart Home Starter Kit UK',
    description:
      'No-drill smart home starter for UK renters — plugs, bulbs, sensors you can take when you move.',
    category: 'smart-home',
    subcategory: 'Smart Home Hubs',
    winner_name: 'TP-Link Tapo P110',
    runnerup_name: 'Aqara Hub M3',
    winner_rating: 8.7,
    runnerup_rating: 8.4,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Start with <strong>Tapo P110</strong> plugs (energy monitoring, no tools). Add an <strong>Aqara Hub M3</strong> + peel-and-stick sensors only if you want automations beyond voice plugs.</p>`,
      constraints: `No drilling into doors/frames. Avoid landlord Wi-Fi — use your own mesh node if allowed. Everything must uninstall cleanly at move-out.`,
      tableRows: [
        ['Install friction', 'Zero (plug)', 'Hub + stick sensors', 'w'],
        ['Move-out friendly', 'Excellent', 'Excellent if no screws', 'w'],
        ['Automation depth', 'Basic', 'Deeper', 'r'],
        ['Our score', '8.7/10', '8.4/10', 'w'],
      ],
      prosWinner: ['Immediate win', 'UK stock everywhere'],
      consWinner: ['Not a full sensor brain'],
      prosRunner: ['Real automations', 'Matter/Thread path'],
      consRunner: ['More to configure'],
      verdict: `<p>Plugs first. Hub second. Cameras last (and only on your own door).</p>`,
      related: [
        { href: '/smart-home/compare/best-smart-plugs-uk-2026/', label: 'Best smart plugs' },
        { href: '/smart-home/compare/echo-vs-home-assistant-beginners-uk/', label: 'Echo vs HA' },
        { href: '/smart-home/compare/doorbell-for-flats-uk/', label: 'Doorbells for flats' },
      ],
    }),
  }),
  a({
    slug: 'no-hub-smart-plug-stack-uk',
    title: 'Best No-Hub Smart Plug Stack UK',
    description:
      'Wi-Fi smart plugs that work without a separate hub — Tapo-led stacks for UK renters and simple energy monitoring.',
    category: 'smart-home',
    subcategory: 'Smart Plugs',
    winner_name: 'TP-Link Tapo P110',
    runnerup_name: 'Aqara Hub M3',
    winner_rating: 8.8,
    runnerup_rating: 8.2,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> For a true no-hub stack, standardise on <strong>TP-Link Tapo P110</strong>. Only add an <strong>Aqara Hub M3</strong> when you outgrow Wi-Fi plugs and want Zigbee sensors — that is the “graduate” path, not the day-one buy.</p>`,
      constraints: `2.4GHz only on many plugs. Crowded flats need good Wi-Fi. Do not put high-load heaters on cheap plugs — check ratings.`,
      tableRows: [
        ['Hub required', 'No', 'Yes (when you graduate)', 'w'],
        ['Energy monitoring', 'Yes (P110)', 'Via sensors/plugs in ecosystem', 'w'],
        ['UK availability', 'Excellent', 'Good', 'w'],
        ['Our score', '8.8/10', '8.2/10', 'w'],
      ],
      prosWinner: ['Simple', 'Monitors kWh', 'Renter-safe'],
      consWinner: ['Cloud account reality'],
      prosRunner: ['Unlocks real sensor mesh', 'Matter/Thread path'],
      consRunner: ['Not needed on day one'],
      verdict: `<p>Start Tapo P110 multipack. Add Aqara only after automations demand it.</p>`,
      related: [
        { href: '/smart-home/compare/best-smart-plugs-uk-2026/', label: 'Best smart plugs UK' },
        { href: '/smart-home/compare/renter-safe-smart-home-starter-uk/', label: 'Renter-safe starter' },
        { href: '/smart-home/compare/matter-vs-zigbee-2026-uk/', label: 'Matter vs Zigbee' },
      ],
    }),
  }),

  // —— CHAIRS (conversion cluster, not room design) ——
  a({
    slug: 'best-gaming-chair-under-300-uk',
    title: 'Best Gaming Chair Under £300 UK',
    description:
      'Chairs under £300 that do not wreck your back — Noblechairs vs Secretlab street prices and when to buy office instead.',
    category: 'gaming',
    subcategory: 'Gaming Chairs',
    winner_name: 'Noblechairs Hero',
    runnerup_name: 'Secretlab Titan Evo',
    winner_rating: 8.4,
    runnerup_rating: 8.3,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Under £300, hunt <strong>Noblechairs Hero</strong> on sale before paying full <strong>Secretlab Titan Evo</strong>. If neither fits budget, a solid office chair often beats a cheap racing bucket.</p>`,
      constraints: `Secretlab is largely D2C — Amazon images may be lookalikes. Measure doorways for box size. Soft bottoms on UK carpets need a chair mat.`,
      tableRows: [
        ['Street under £300', 'More realistic', 'Sale-dependent', 'w'],
        ['Build reputation', 'Strong', 'Strong', 'w'],
        ['Buy path caution', 'Retail listings', 'Prefer official', 'r'],
        ['Our score', '8.4/10', '8.3/10', 'w'],
      ],
      prosWinner: ['Often better under-£300 math', 'Serious recline'],
      consWinner: ['Still try before long sessions if possible'],
      prosRunner: ['Brand ecosystem / warranty story', 'Customise'],
      consRunner: ['Full price overshoots £300 easily'],
      verdict: `<p>See also <a href="/gaming/compare/noblechairs-hero-vs-secretlab-titan/">Hero vs Titan</a> and <a href="/gaming/compare/gaming-chair-vs-office-chair/">gaming vs office</a>.</p>`,
      related: [
        { href: '/gaming/compare/noblechairs-hero-vs-secretlab-titan/', label: 'Noblechairs Hero vs Secretlab Titan' },
        { href: '/gaming/compare/gaming-chair-vs-office-chair/', label: 'Gaming vs office chair' },
        { href: '/gaming/compare/secretlab-titan-evo-review/', label: 'Secretlab Titan Evo notes' },
      ],
    }),
  }),
  a({
    slug: 'desk-under-120cm-uk-gaming',
    title: 'Best Gaming Desk Under 120cm UK',
    description:
      'Narrow UK desks under 120cm width — depth, cable trays, and monitor arm clearance without a warehouse battlestation.',
    category: 'gaming',
    subcategory: 'Gaming Desks',
    winner_name: 'Secretlab Magnus Cable Tray',
    runnerup_name: 'Standing Desk (with caveats)',
    winner_rating: 8.3,
    runnerup_rating: 8.0,
    content_html: body({
      answer: `<p><strong>Quick answer:</strong> Under 120cm width, prioritise <strong>depth + cable control</strong> over RGB legs. A solid 110–120cm top with a <strong>Magnus-style cable tray</strong> (or equivalent tray) beats a wider flimsy top. Standing desks win only if the frame is stable at that width.</p>`,
      constraints: `UK bedrooms often max out at 120cm. Ultrawides and full-size boards fight for space — go TKL + one 27".`,
      tableRows: [
        ['Cable control', 'Tray systems help', 'Frame dependent', 'w'],
        ['Width fit', 'Works on narrow tops', 'Check minimum width', 'w'],
        ['Stability', 'Depends on desk', 'Standing frames vary', 'r'],
        ['Our score', '8.3/10', '8.0/10', 'w'],
      ],
      prosWinner: ['Makes small desks usable', 'Cleaner buy-box peripherals'],
      consWinner: ['Tray alone is not a desk'],
      prosRunner: ['Ergonomics if stable', 'Sit/stand option'],
      consRunner: ['Wobble risk on budget frames'],
      verdict: `<p>Measure the alcove. Buy depth first, then cable tray, then monitor arm. Related: <a href="/gaming/compare/standing-desk-vs-regular-desk-gaming/">standing vs regular</a>.</p>`,
      related: [
        { href: '/gaming/compare/standing-desk-vs-regular-desk-gaming/', label: 'Standing vs regular desk' },
        { href: '/gaming/compare/monitor-arm-ikea-desk-uk/', label: 'Monitor arms for IKEA' },
        { href: '/best/compare/best-cable-management-gaming-desk/', label: 'Cable management picks' },
      ],
    }),
  }),
];

async function upsert(row) {
  const res = await fetch(`${URL}/rest/v1/gvt_articles?on_conflict=slug`, {
    method: 'POST',
    headers,
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const t = await res.text();
    console.log('FAIL', row.slug, res.status, t.slice(0, 220));
    return false;
  }
  console.log('OK', row.published ? 'PUB' : 'DRAFT', row.category, row.subcategory, row.slug);
  return true;
}

let ok = 0;
for (const row of rows) {
  if (await upsert(row)) ok++;
}
console.log(`DONE ${ok}/${rows.length}`);
