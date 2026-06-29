import type { RouteDef } from '@/types';

// ---------------------------------------------------------------------------
// Simulated driver routes across South-Central Delhi NCR.
// Coordinates are hardcoded GPS waypoints in GeoJSON order [lng, lat]
// (approximate, not road-snapped - the focus is the corridor/H3 logic).
// ---------------------------------------------------------------------------

export const ROUTES: RouteDef[] = [
  {
    id: 'cp-nehru-place',
    name: 'Connaught Place to Nehru Place',
    category: 'Business',
    description: 'Central business spine through Lutyens Delhi and South Extension.',
    coordinates: [
      [77.2167, 28.6312],
      [77.2196, 28.6231],
      [77.2245, 28.6155],
      [77.2278, 28.6042],
      [77.2268, 28.5946],
      [77.2312, 28.5852],
      [77.2389, 28.5743],
      [77.2456, 28.5641],
      [77.2511, 28.5498],
    ],
  },
  {
    id: 'hauz-khas-saket',
    name: 'Hauz Khas Residential Loop',
    category: 'Residential',
    description: 'South Delhi residential belt: Hauz Khas, Green Park, Saket, Malviya Nagar.',
    coordinates: [
      [77.2061, 28.5535],
      [77.1995, 28.5478],
      [77.2032, 28.5575],
      [77.2121, 28.5542],
      [77.2167, 28.5421],
      [77.2152, 28.5301],
      [77.2061, 28.5248],
      [77.1992, 28.5318],
      [77.1968, 28.5432],
    ],
  },
  {
    id: 'aerocity-dwarka',
    name: 'Aerocity to Dwarka (Airport)',
    category: 'Airport',
    description: 'Airport corridor: Aerocity, IGI Terminal 3, toward Dwarka sub-city.',
    coordinates: [
      [77.1232, 28.5498],
      [77.1112, 28.5531],
      [77.0986, 28.5562],
      [77.0831, 28.5648],
      [77.0689, 28.5762],
      [77.0552, 28.5871],
      [77.0461, 28.5972],
    ],
  },
];

export const DEFAULT_ROUTE_ID = ROUTES[0].id;

export function getRouteById(id: string): RouteDef {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0];
}
