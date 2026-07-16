export interface SpaceHub {
  slug: string;
  name: string;
  kicker: string;
  headline: string;
  lede: string;
  categoryHref: string;
  categoryLabel: string;
  tiers: { label: string; budget: string; notes: string }[];
  spokes: { href: string; label: string }[];
  kitTitle: string;
  theme: 'gaming' | 'gym' | 'cave' | 'shed';
}

export const SPACES: SpaceHub[] = [
  {
    slug: 'gaming-room',
    name: 'Gaming room',
    kicker: 'Space hub',
    headline: 'Build a gaming desk that actually works in a UK room.',
    lede: 'Monitors, chairs, keyboards, cable plans — ranked by budget and flat constraints, not influencer unboxings.',
    categoryHref: '/gaming/',
    categoryLabel: 'Gaming comparisons',
    tiers: [
      { label: 'Starter', budget: '≤ £500', notes: 'Desk under 120cm, one good monitor, quiet headset for flats.' },
      { label: 'Solid', budget: '≤ £1,500', notes: '1440p panel, ISO-UK board, arm + cable spine, chair that lasts.' },
      { label: 'No compromise', budget: '≤ £5,000', notes: 'Dual/ultrawide, HE keyboard, acoustic treatment, power plan.' },
    ],
    spokes: [
      { href: '/gaming/compare/wooting-60he-vs-razer-huntsman-v3-pro/', label: 'Wooting 60HE vs Huntsman V3 Pro' },
      { href: '/gaming/compare/logitech-superlight-2-vs-razer-viper-v3/', label: 'Superlight 2 vs Viper V3 Pro' },
      { href: '/best/compare/best-27-inch-gaming-monitors-2026/', label: 'Best 27" gaming monitors' },
      { href: '/gaming/', label: 'All gaming compares' },
    ],
    kitTitle: 'Gaming Room Build Kit',
    theme: 'gaming',
  },
  {
    slug: 'garage-gym',
    name: 'Garage gym',
    kicker: 'Space hub',
    headline: 'UK garage gym under a 2.4m ceiling.',
    lede: 'Racks, flooring, noise for terraces, and carts that fit a single garage — higher affiliate rates, clearer constraints.',
    categoryHref: '/home-gym/',
    categoryLabel: 'Home gym comparisons',
    tiers: [
      { label: 'Bare bones', budget: '≤ £500', notes: 'Adjustable DBs, mat, pull-up alternative, neighbour-aware cardio.' },
      { label: 'Working gym', budget: '≤ £1,000', notes: 'Half rack or fold-away, rubber tiles, bench that fits width.' },
      { label: 'Full bay', budget: '≤ £2,500', notes: 'Rack + plates, flooring stack, power for fan/heater.' },
    ],
    spokes: [
      { href: '/best/compare/best-rack-for-single-garage-uk/', label: 'Best rack for single garage' },
      { href: '/best/compare/mirafit-vs-rogue-uk/', label: 'Mirafit vs Rogue UK' },
      { href: '/best/compare/home-gym-under-1000-uk/', label: 'Home gym under £1,000' },
      { href: '/home-gym/', label: 'All home gym compares' },
    ],
    kitTitle: 'UK Garage Gym Build Kit',
    theme: 'gym',
  },
  {
    slug: 'man-cave',
    name: 'Man cave',
    kicker: 'Space hub',
    headline: 'A room that is not just a TV and a sofa.',
    lede: 'Seating, lighting, sound, mini-fridge power, and wall packs — built for evenings, not showrooms.',
    categoryHref: '/best/',
    categoryLabel: 'Best picks',
    tiers: [
      { label: 'Corner', budget: '≤ £400', notes: 'Lighting + soundbar + cable hide + one hero wall.' },
      { label: 'Evening room', budget: '≤ £1,200', notes: 'Seating upgrade, fridge plan, acoustic panel starter.' },
      { label: 'Full cave', budget: '≤ £3,000', notes: 'Projector/TV decision, bar cart, power & heat.' },
    ],
    spokes: [
      { href: '/smart-home/compare/homey-pro-vs-aqara-hub-m3/', label: 'Homey Pro vs Aqara M3' },
      { href: '/gaming/compare/best-gaming-chair-under-300-uk/', label: 'Best gaming chair under £300' },
      { href: '/smart-home/', label: 'Smart home compares' },
    ],
    kitTitle: 'Man Cave Build Kit',
    theme: 'cave',
  },
  {
    slug: 'pub-shed',
    name: 'Pub shed',
    kicker: 'Space hub',
    headline: 'Garden shed that feels like a local.',
    lede: 'Power, weatherproofing, seating, lighting, and bar basics for UK summers and damp winters.',
    categoryHref: '/best/',
    categoryLabel: 'Best picks',
    tiers: [
      { label: 'Dry shell', budget: '≤ £600', notes: 'Power run, LED, seating, weather seal checklist.' },
      { label: 'Proper pub', budget: '≤ £1,500', notes: 'Bar top, fridge, heaters, outdoor-safe finishes.' },
      { label: 'All-weather', budget: '≤ £3,500', notes: 'Insulation, AV, security, neighbour-noise plan.' },
    ],
    spokes: [
      { href: '/smart-home/compare/renter-safe-smart-home-starter-uk/', label: 'Renter-safe smart starter' },
      { href: '/smart-home/compare/best-smart-plugs-uk-2026/', label: 'Best smart plugs UK' },
      { href: '/best/', label: 'Best picks' },
    ],
    kitTitle: 'Pub Shed Build Kit',
    theme: 'shed',
  },
];

export function getSpace(slug: string): SpaceHub | undefined {
  return SPACES.find((s) => s.slug === slug);
}
