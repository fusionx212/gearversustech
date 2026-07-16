# Gear Versus Tech — Design Choices

**Status:** Approved — implementing on `cursor/gvt-visual-redesign` (local build; no deploy).  
**Date:** 2026-07-16  
**Site:** https://gearversustech.com  
**Skill:** estate `visual-experience` (+ art-direction dials)  
**Master plan:** `docs/GVT-MASTER-PLAN.md` §F  
**Mood board:** see session-generated `gvt-design-moodboard.png` (workshop dark + amber signal)

---

## Kill list (current site)

Audit of `src/styles/global.css`, homepage, compare templates, `BaseLayout`:

| Kill | Why |
|---|---|
| **Inter** + system fallbacks | Default SaaS stack; brand invisible without logo colour hack |
| **Accent `#2563eb`** + blue washes | Generic “trust blue”; winner cards look like Bootstrap primary |
| **White Wirecutter shell** (`#fff` / `#fafbfc`) | Competent clone, zero room/gear identity |
| **Emoji category heroes** (🏠 🎮) + Deals 💰 | Flat-card emoji = AI template smell |
| **Pill badges** (hero-badge, vs-badge rounded-full) | Overused; compete with product |
| **2×2 card grid as home composition** | Section of cards, not one brand composition |
| **Centered badge + H1 + paragraph hero** | No product/place in first viewport; brand only in nav |
| **Soft grey borders + soft shadows** | SaaS card language |
| **Max-width 880px everywhere** | Newsletter column; hubs need full-bleed room bands |
| **Blue “Our Pick” wash on buy boxes** | Accent paints the decision; product should own the stage |
| **Three.js in package.json** | Dead weight; never load on home/compare (master plan §F) |
| **Glass sticky header blur** | Fine as craft later; not the identity |

**Keep (structure, not look):** routes, schemas, affiliate CTA keys, Amazon/eBay button semantics, GSAP availability, methodology/disclosure/legal, buy-box data model.

---

## Emotional register + art direction

**Register:** Decisive, workshop-honest, slightly technical — “someone already built the room and ranked the cart.” Not hype-gamer neon, not soft lifestyle blog, not enterprise SaaS.

**One-sentence art direction:**  
Dark graphite workshop surfaces, signal-amber “versus” marks, and product photography on cool white stages — so hubs feel like rooms and compare pages feel like honest buy benches.

**Signature moment (later build):** On compare, the winner buy-box mounts first: amber “OUR PICK” ticks in, price settles in mono, then CTAs — scroll never delays LCP of the product image.

---

## Three dials (final recommendation)

| Dial | Value | Why |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | Room/gear brand must be recognisable without the nav; escape Wirecutter grey |
| `MOTION_INTENSITY` | **4** | GSAP reveals OK; motion must never compete with buy boxes or LCP |
| `VISUAL_DENSITY` | **6** | Spec tables + verdicts stay dense; space hubs breathe more than spokes |

(Matches master-plan draft; locked here as recommended.)

---

## Colour system (CSS variables)

Primary mode: **dark** (see Dark vs light below).

```css
:root {
  /* Surfaces */
  --bg:            #0C0F12;  /* page void — graphite workshop */
  --surface:       #151A1F;  /* sections / sticky header */
  --surface-2:     #1C232B;  /* raised panels, FAQ, TOC */
  --border:        #2A333D;  /* hairline rules */
  --border-strong: #3D4A57;  /* focus / active edges */

  /* Text */
  --text:          #E8ECF0;  /* primary */
  --text-secondary:#9AA5B1;  /* body support */
  --text-muted:    #6B7682;  /* meta, breadcrumb */

  /* Brand signal */
  --accent:        #E5A318;  /* versus / OUR PICK / kit primary */
  --accent-hover:  #F0B42A;
  --accent-dim:    rgba(229, 163, 24, 0.14);

  /* Commerce semantics */
  --success:       #3DCC8A;  /* good price / in stock / verdict OK */
  --warn:          #F0A060;  /* price caveat / check stock */
  --danger:        #E85D5D;  /* cons / don’t buy */

  /* Product stage (always light — Amazon photos) */
  --stage:         #FFFFFF;
  --stage-edge:    #E2E6EA;

  /* CTAs */
  --amazon:        #232F3E;  /* keep retailer cue */
  --ebay:          #E53238;
  --kit:           #E5A318;  /* Stripe kit = brand accent solid */
  --pod:           #8B9AAB;  /* POD = cool steel outline/fill — not terracotta */
}
```

**Rules:** No purple gradients. No cream `#F4F1EA` + terracotta. Accent is **amber signal**, used sparingly (VS mark, winner badge, kit CTA) — never as a page wash behind products.

---

## Typography

| Role | Font | Weight use | Why |
|---|---|---|---|
| **Display** | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | 600–700 for H1, logo, “VS”, hub titles | Geometric, slightly technical; reads as gear/engineering without gamer chrome |
| **Body** | [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) | 400 body, 600 labels | Long compare articles stay readable; neutral authority without Inter |
| **Mono** | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | 500–700 prices, ratings, table cells | Spec/price honesty; already in stack |

**Scale (mobile → desktop):**  
H1 `clamp(2rem, 5vw, 3.25rem)` · H2 `1.35–1.5rem` · body `1.05rem/1.65` · price `1.5–1.85rem` mono · meta `0.8rem`.

**Logo treatment:** Wordmark in Space Grotesk; **Versus** in `--accent` (keep existing `GearVersusTech` split, restyle type only).

---

## Layout rules

### Hero (home)

- Full-bleed room image (gaming desk or garage gym) as the first viewport plane — edge to edge.
- Brand wordmark at hero scale (not only nav).
- One headline + one short line + one CTA group (e.g. “Browse rooms” / “Latest picks”).
- **No** pill badge, emoji cards, stats strip, or inset media card.
- Hint of next section (space bands) at common viewport heights.

### Space hubs

- Stacked **full-bleed bands** (one room per band): photo left/full, copy + tier links + kit CTA — not a card grid of categories.
- Budget tiers as a simple horizontal rule of £ bands, not three equal cards with shadows.
- Email capture as a single quiet strip, not a floating promo chip.

### Compare buy-box

- Dark page chrome; **product sits on `--stage` white square** (honest Amazon crop).
- Winner + runner-up as a **bench**: two columns, shared baseline for price/CTAs; “VS” as typographic amber mark, not a circular chip.
- Winner: amber badge + stronger border (`--accent`), **no blue fill wash**.
- Empty ASIN fail-soft: keep layout height; show “Price updating” in muted mono — never a collapsed blank card.
- Spec table: dense, full-bleed within content column (~720–800px text, buy-box up to ~960px).

### Latest comparisons / lists

- Prefer **horizontal rows** (thumb | title | winner | price) over equal card grids where possible.
- If grid remains for density, drop card chrome: no shadow, no radius theatre — image + type only.

### Whitespace

- Hubs: generous vertical rhythm (breathing room for photography).
- Compare: tighter — verdict and buy-box within first scroll on mobile.

---

## Motion map

| Moves | How |
|---|---|
| Section enter (hubs, lists) | GSAP opacity + `y: 12→0`, ~0.4–0.5s, once via ScrollTrigger/IO |
| Winner badge | Short accent tick / opacity on mount |
| CTA hover | `translateY(-1px)` + border/background only |
| FAQ open | Height/opacity; keep focus |

| Does **not** move |
|---|
| Decorative Three.js / WebGL on home or compare |
| Parallax that shifts product LCP |
| Looping ambient particles / glow |
| Motion that runs before buy-box image paints |

**`prefers-reduced-motion`:** all elements at final composed state; no y-offset start.

---

## Imagery

| Surface | Treatment |
|---|---|
| **Home / space hubs** | Full-bleed room renders or real UK room photos (desk, garage gym, man cave, pub shed). Desaturated cool; amber only in UI chrome, not graded into photos. |
| **Compare** | Official product photos on `--stage` white; never cropped into lifestyle circles. |
| **List thumbs** | Product on stage, small; or room crop only for hub entries. |
| **POD** | Separate gallery treatment later; do not mix Printful mockups into affiliate buy-boxes. |

No stock “happy couple with headphones.” No emoji stand-ins for missing images — use stage + muted label.

---

## Component vocabulary

| Component | Spec |
|---|---|
| **Primary button (kit)** | Solid `--kit` / `--accent`, dark text `#0C0F12`, Space Grotesk 600, square-ish radius `6px` |
| **Affiliate Amazon** | `--amazon` fill, white text — retailer cue preserved |
| **Affiliate eBay** | Outline `--ebay` or white fill + red border (current pattern OK, restyle radius) |
| **POD CTA** | Ghost/outline `--pod` steel; label “Print pack” / “Wall set” — never same weight as kit |
| **Winner badge** | Small rectangle (not pill): `OUR PICK` · `--accent` bg · dark text · tracking wide |
| **Runner-up badge** | Same shape, `--surface-2` + `--border-strong`, text secondary |
| **Price** | JetBrains Mono, `--text`; if deal vs usual, success tint on delta only |
| **Warn price note** | `--warn` 0.75rem under price (“Confirm on retailer”) |
| **Verdict block** | `--surface-2` + left rule `--success` (not green pastel card fill) |

---

## Dark vs light

**Primary mode: dark (`--bg #0C0F12`).**

**Rationale:** Differentiates from Wirecutter/RTINGS clones; matches gaming + man-cave + garage-gym atmosphere; product photos pop harder on white stages inside dark chrome; amber signal reads as “workshop lamp,” not SaaS blue. Long-form remains readable via `--text-secondary` and Source Sans 3 at comfortable size — not neon-on-black.

Light mode is **not** a v1 deliverable. If ever needed, invert surfaces only; keep accent and stage rules.

---

## Mobile first

- Buy-box stacks: Winner full width → Runner-up; CTAs full-width tap targets ≥44px.
- Hero: brand + headline remain above the fold; room image as background with scrim (`linear-gradient` from `--bg`) so type stays legible — no floating chips on the photo.
- Hub bands: photo as top full-bleed block, copy below (no side-by-side until `md`).
- Tables: horizontal scroll in `.table-wrap`; sticky first column optional later.
- Nav: collapse to minimal wordmark + “Compare” / menu; drop emoji.
- Density dial 6: on small screens, collapse “Also compared” to 2-col product stage grid without card shadows.

---

## Approval checklist (Dale)

- [ ] Approve art direction sentence + dark primary
- [ ] Approve dials **7 / 4 / 6**
- [ ] Approve palette hex (especially amber accent vs any blue)
- [ ] Approve type trio: Space Grotesk / Source Sans 3 / JetBrains Mono
- [ ] Approve kill list (emoji hubs, Inter, blue wash, card-grid home)
- [ ] Then explicit **build** command → implement four templates only (home, hub, compare, product CTA)

**Stop line:** No CSS/implementation until Dale says build. No deploy.
