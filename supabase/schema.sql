-- gearversustech dynamic content schema
-- Articles stored in Supabase. Site reads at render time.
-- No deploy needed to add/edit/update content.

-- Articles table
CREATE TABLE IF NOT EXISTS gvt_articles (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('smart-home', 'gaming', 'best')),
  subcategory TEXT NOT NULL DEFAULT '',
  content_html TEXT NOT NULL,
  winner_name TEXT,
  winner_rating NUMERIC(3,1),
  runnerup_name TEXT,
  runnerup_rating NUMERIC(3,1),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gvt_articles_slug ON gvt_articles(slug);
CREATE INDEX IF NOT EXISTS idx_gvt_articles_category ON gvt_articles(category);

-- Affiliate links table — one place to update, affects all articles
CREATE TABLE IF NOT EXISTS gvt_affiliate_links (
  id BIGSERIAL PRIMARY KEY,
  link_key TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  amazon_asin TEXT,
  amazon_url TEXT,
  ebay_search TEXT,
  ebay_url TEXT,
  awin_url TEXT,
  uk_price_gbp NUMERIC(8,2),
  image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gvt_links_key ON gvt_affiliate_links(link_key);

-- Insert affiliate links for current products
INSERT INTO gvt_affiliate_links (link_key, product_name, amazon_asin, uk_price_gbp) VALUES
  ('homey-pro-2026', 'Homey Pro (2026 Edition)', 'B0CJY7N4R5', 349.00),
  ('aqara-hub-m3', 'Aqara Hub M3', 'B0CN3QKX9W', 109.00),
  ('govee-g1', 'Govee Gaming Light Kit G1', 'B0CK9V471X', 69.99),
  ('philips-hue-sync-box-8k', 'Philips Hue Play HDMI Sync Box 8K', 'B08CJTC2QM', 249.99)
ON CONFLICT (link_key) DO NOTHING;

-- Click tracking
CREATE TABLE IF NOT EXISTS gvt_clicks (
  id BIGSERIAL PRIMARY KEY,
  retailer TEXT NOT NULL,
  product_key TEXT NOT NULL,
  article_slug TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gvt_clicks_article ON gvt_clicks(article_slug);
CREATE INDEX IF NOT EXISTS idx_gvt_clicks_date ON gvt_clicks(clicked_at DESC);

-- Digital kit catalog (Stripe) + line items — see migrations gvt_kits_catalog / pack_clarity / product_quality
-- Applied live via Supabase MCP; kept here as reference.
CREATE TABLE IF NOT EXISTS gvt_kits (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_gbp NUMERIC(8,2) NOT NULL,
  stripe_payment_link TEXT,
  stripe_product_id TEXT,
  hero_image_url TEXT,
  kit_mockup_url TEXT,
  space_slug TEXT,
  sku TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  honest_take TEXT,
  review_summary TEXT,
  who_for JSONB DEFAULT '[]'::jsonb,
  who_not_for JSONB DEFAULT '[]'::jsonb,
  setup_notes TEXT,
  tier_labels JSONB DEFAULT '[]'::jsonb,
  compare_hub_href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gvt_kit_items (
  id BIGSERIAL PRIMARY KEY,
  kit_slug TEXT NOT NULL REFERENCES gvt_kits(slug) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  product_name TEXT NOT NULL,
  link_key TEXT,
  notes TEXT,
  why_in_kit TEXT,
  compare_href TEXT,
  score_out_of_10 NUMERIC(3,1),
  qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE gvt_affiliate_links
  ADD COLUMN IF NOT EXISTS score_out_of_10 NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS honest_take TEXT,
  ADD COLUMN IF NOT EXISTS review_summary TEXT,
  ADD COLUMN IF NOT EXISTS review_themes JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS buy_reasons JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS usage_ideas JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mockup_url TEXT,
  ADD COLUMN IF NOT EXISTS drawbacks JSONB DEFAULT '[]'::jsonb;
