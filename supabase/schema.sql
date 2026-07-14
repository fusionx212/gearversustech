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
