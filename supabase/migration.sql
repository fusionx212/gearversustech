-- gearversustech_clicks table
-- Tracks outbound affiliate link clicks from the site
-- Replicates the ukaircontracker aircon_clicks pattern

CREATE TABLE IF NOT EXISTS gearversustech_clicks (
  id BIGSERIAL PRIMARY KEY,
  retailer TEXT NOT NULL CHECK (retailer IN ('amazon', 'ebay', 'awin')),
  product TEXT NOT NULL,
  page TEXT,
  user_agent TEXT,
  ip TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gvt_clicks_retailer ON gearversustech_clicks(retailer);
CREATE INDEX IF NOT EXISTS idx_gvt_clicks_clicked_at ON gearversustech_clicks(clicked_at DESC);

-- gearversustech_subscribers table
-- Captures email signups from the inline form

CREATE TABLE IF NOT EXISTS gearversustech_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'inline-form',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT FALSE
);
