// ---------------------------------------------------------------------------
// Candidate pickup points (e.g. EV charging hubs, popular stands, demand
// hotspots). Generated deterministically with a seeded PRNG so the demo is
// reproducible and the same points appear on every load / for every evaluator.
// ---------------------------------------------------------------------------

// Small deterministic PRNG (mulberry32).
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Bounding box covering all routes + zones (Koramangala / Indiranagar / HSR).
const BBOX = {
  minLng: 77.6,
  maxLng: 77.652,
  minLat: 12.905,
  maxLat: 12.962,
};

const PLACE_PREFIXES = [
  'Metro Stn',
  'Tech Park',
  'Mall',
  'Market',
  'Charging Hub',
  'Bus Stop',
  'Apartments',
  'Cafe',
  'Hospital',
  'College',
];

function generatePickupPoints(count = 150, seed = 42) {
  const rand = mulberry32(seed);
  const points = [];
  for (let i = 0; i < count; i++) {
    const lng = BBOX.minLng + rand() * (BBOX.maxLng - BBOX.minLng);
    const lat = BBOX.minLat + rand() * (BBOX.maxLat - BBOX.minLat);
    const prefix = PLACE_PREFIXES[Math.floor(rand() * PLACE_PREFIXES.length)];
    points.push({
      id: `P-${String(i + 1).padStart(3, '0')}`,
      name: `${prefix} ${i + 1}`,
      lng: Number(lng.toFixed(6)),
      lat: Number(lat.toFixed(6)),
    });
  }
  return points;
}

export const PICKUP_POINTS = generatePickupPoints(150, 42);
export { generatePickupPoints };
