export type StudioSlotKey = 'desk_140' | 'monitor_27' | 'chair_ergonomic' | 'smart_light' | 'gym_rack' | 'gym_flooring';

export interface StudioRecommendation {
  pick: string;
  reason: string;
  image: string;
  buy: string;
  buyLabel: string;
  compare: string;
  source: string;
  comparisonScore: number;
}

/**
 * Product truth for generic Studio objects. Keep this aligned with the
 * published Supabase comparison winner, never with names inferred by an image model.
 */
export const STUDIO_RECOMMENDATIONS: Record<StudioSlotKey, StudioRecommendation> = {
  desk_140: {
    pick: 'MAIDeSITe Standing Desk 140x70',
    reason: 'The 140 cm winner in GVT’s garden-shed desk-size comparison.',
    image: '/images/products/maidesite-standing-desk-140x70.webp',
    buy: '/c/amazon/maidesite-standing-desk-140x70',
    buyLabel: 'Check live price ↗',
    compare: '/best/compare/desk-size-for-garden-shed-uk/',
    source: 'Desk Size for Garden Sheds UK',
    comparisonScore: 8.4,
  },
  monitor_27: {
    pick: 'Alienware AW2725DF',
    reason: 'The current winner in GVT’s published 27-inch gaming-monitor roundup.',
    image: '/images/products/alienware-aw2725df.webp',
    buy: '/c/amazon/alienware-aw2725df',
    buyLabel: 'Check live price ↗',
    compare: '/best/compare/best-27-inch-gaming-monitors-2026/',
    source: 'Best 27-Inch Gaming Monitors 2026',
    comparisonScore: 9.1,
  },
  chair_ergonomic: {
    pick: 'Noblechairs Hero',
    reason: 'The winner in GVT’s premium gaming-chair comparison.',
    image: '/images/products/noblechairs-hero.webp',
    buy: '/c/amazon/noblechairs-hero',
    buyLabel: 'Check live price ↗',
    compare: '/gaming/compare/noblechairs-hero-vs-secretlab-titan/',
    source: 'Noblechairs Hero vs Secretlab Titan Evo',
    comparisonScore: 8.9,
  },
  smart_light: {
    pick: 'Govee Gaming Light Kit G1',
    reason: 'The winner in GVT’s Govee versus Philips Hue gaming-light comparison.',
    image: '/images/products/govee-g1.webp',
    buy: '/c/amazon/govee-gaming-light-kit-g1',
    buyLabel: 'Check live price ↗',
    compare: '/smart-home/compare/govee-gaming-lights-vs-philips-hue-play/',
    source: 'Govee Gaming Light Kit vs Philips Hue Play',
    comparisonScore: 8.7,
  },
  gym_rack: {
    pick: 'Mirafit M3 Half Rack',
    reason: 'The published GVT winner for a space-constrained UK garage gym.',
    image: '/images/kits/uk-garage-gym-build-kit.webp',
    buy: '/home-gym/compare/best-rack-for-single-garage-uk/',
    buyLabel: 'Open winning comparison →',
    compare: '/home-gym/compare/best-rack-for-single-garage-uk/',
    source: 'Best Rack for Single Garage UK',
    comparisonScore: 8.7,
  },
  gym_flooring: {
    pick: '20mm rubber tiles + underlay',
    reason: 'GVT’s current construction recommendation for noise-sensitive UK spaces.',
    image: '/images/rooms/garage.jpg',
    buy: '/home-gym/compare/rubber-flooring-noise-terraces-uk/',
    buyLabel: 'Open flooring comparison →',
    compare: '/home-gym/compare/rubber-flooring-noise-terraces-uk/',
    source: 'Rubber Flooring Noise for UK Terraces',
    comparisonScore: 8.8,
  },
};

export const SPACE_SLOT_OPTIONS: Record<string, StudioSlotKey[]> = {
  'gaming-room': ['desk_140', 'monitor_27', 'chair_ergonomic', 'smart_light'],
  'garden-office': ['desk_140', 'monitor_27', 'chair_ergonomic', 'smart_light'],
  'man-cave': ['monitor_27', 'chair_ergonomic', 'smart_light'],
  'shed-gym': ['gym_flooring', 'gym_rack'],
};
