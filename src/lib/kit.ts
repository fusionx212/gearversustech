/** Stripe Payment Link for digital room-build kits (set in Netlify / .env). */
export function getKitUrl(): string | null {
  const url =
    import.meta.env.PUBLIC_STRIPE_KIT_URL ||
    import.meta.env.PUBLIC_STRIPE_GAMING_KIT_URL ||
    '';
  if (!url || !/^https:\/\//i.test(url)) return null;
  return url;
}

export function getPodUrl(): string | null {
  const url = import.meta.env.PUBLIC_PRINTFUL_STORE_URL || '';
  if (!url || !/^https:\/\//i.test(url)) return null;
  return url;
}
