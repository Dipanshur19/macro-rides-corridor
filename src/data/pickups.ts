import type { PickupPoint } from '@/types';
import { mulberry32 } from '@/utils/helpers';
import { PICKUP_COUNT, PICKUP_SEED } from '@/constants/config';

// ---------------------------------------------------------------------------
// 500 mock pickup points (EV charging hubs, metro stands, malls, demand
// hotspots) scattered across the NCR demo bounding box. Generated with a
// seeded PRNG so the dataset is identical on every load / for every evaluator.
// ---------------------------------------------------------------------------

const BBOX = { minLng: 77.04, maxLng: 77.27, minLat: 28.5, maxLat: 28.645 };

const CATEGORIES = [
  'Metro Station',
  'EV Charging Hub',
  'Mall',
  'Market',
  'Tech Park',
  'Hospital',
  'Bus Stand',
  'Residential Gate',
  'Hotel',
  'College',
];

function generate(count: number, seed: number): PickupPoint[] {
  const rand = mulberry32(seed);
  const points: PickupPoint[] = [];
  for (let i = 0; i < count; i++) {
    const lng = BBOX.minLng + rand() * (BBOX.maxLng - BBOX.minLng);
    const lat = BBOX.minLat + rand() * (BBOX.maxLat - BBOX.minLat);
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
    points.push({
      id: `PU-${String(i + 1).padStart(3, '0')}`,
      name: `${category} ${i + 1}`,
      category,
      lng: Number(lng.toFixed(6)),
      lat: Number(lat.toFixed(6)),
    });
  }
  return points;
}

export const PICKUPS: PickupPoint[] = generate(PICKUP_COUNT, PICKUP_SEED);
