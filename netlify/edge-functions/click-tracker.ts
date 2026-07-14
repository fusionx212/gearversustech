// Netlify Edge Function: click-tracker
// The single place outbound affiliate URLs are built. Every affiliate link on the
// site points at /c/<retailer>/<link_key>, so a link format is fixed once, here.

const PARTNER_TAG = 'gearversustech-21';
const EBAY_CAMPID = '5339164583';

// eBay Partner Network only attributes a click when the full tracking parameter set
// is present. campid alone is silently untracked — the click happens, the commission
// does not. mkevt=1 is the click event; mkrid is the UK rotation id.
const EBAY_MKRID = '710-53481-19255-0';
const EBAY_SITEID = '3'; // eBay UK

function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.co.uk/dp/${asin}?tag=${PARTNER_TAG}&linkCode=ogi`;
}

function buildEbayUrl(keywords: string): string {
  const q = new URLSearchParams({
    _nkw: keywords,
    mkevt: '1',
    mkcid: '1',
    mkrid: EBAY_MKRID,
    siteid: EBAY_SITEID,
    campid: EBAY_CAMPID,
    toolid: '10001',
  });
  return `https://www.ebay.co.uk/sch/i.html?${q}`;
}

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/c/')) return context.next();

  const [retailer, ...rest] = url.pathname.replace('/c/', '').split('/');
  const key = decodeURIComponent(rest.join('/'));

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY');

  // Resolve the product once; both retailers key off the same row.
  let product: { amazon_asin?: string; product_name?: string } | null = null;
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/gvt_affiliate_links?select=amazon_asin,product_name&link_key=eq.${encodeURIComponent(key)}&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
      );
      if (res.ok) product = (await res.json())[0] ?? null;
    } catch {
      // fall through to the keyword-search fallback below
    }
  }

  let redirectUrl: string;
  if (retailer === 'amazon' && product?.amazon_asin) {
    redirectUrl = buildAmazonUrl(product.amazon_asin);
  } else if (retailer === 'amazon') {
    // No ASIN on file: a tagged search still earns, where a dead link earns nothing.
    redirectUrl = `https://www.amazon.co.uk/s?k=${encodeURIComponent(product?.product_name ?? key)}&tag=${PARTNER_TAG}`;
  } else if (retailer === 'ebay') {
    redirectUrl = buildEbayUrl(product?.product_name ?? key.replace(/-/g, ' '));
  } else {
    return new Response('Unknown retailer', { status: 404 });
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/gvt_clicks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          retailer,
          product_key: key,
          article_slug: new URL(request.headers.get('referer') ?? 'https://gearversustech.com').pathname,
        }),
      });
    } catch {
      // Click tracking must never block the redirect.
    }
  }

  return Response.redirect(redirectUrl, 302);
};

export const config = { path: '/c/*' };
