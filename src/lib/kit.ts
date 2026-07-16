/** Stripe Payment Links for digital room-build kits (set in Netlify / .env). */

export function getKitUrl(slug?: string | null): string | null {
  if (slug === 'uk-garage-gym-build-kit' || slug === 'garage-gym') {
    const g =
      import.meta.env.PUBLIC_STRIPE_GARAGE_KIT_URL ||
      import.meta.env.PUBLIC_STRIPE_KIT_URL ||
      '';
    if (g && /^https:\/\//i.test(g)) return g;
  }
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
