import { hexToRgb } from '@/utils/helpers';

// Map/data-layer colours. Chosen to read well on both light and dark basemaps.
export const MAP_COLORS = {
  route: '#2563eb',
  routeTraveled: '#1d4ed8',
  corridor: '#14b8a6',
  eligible: '#16a34a',
  candidate: '#f59e0b', // passed H3 broad-phase but failed exact test
  ineligible: '#94a3b8',
  zone: '#7c3aed',
  h3: '#14b8a6',
  driver: '#4f46e5',
  accent: '#7c3aed',
} as const;

// Pre-computed RGBA tuples for deck.gl (which wants [r,g,b,a] 0-255).
export const DECK_COLORS = {
  eligibleFill: [...hexToRgb(MAP_COLORS.eligible), 200] as [number, number, number, number],
  candidateFill: [...hexToRgb(MAP_COLORS.candidate), 170] as [number, number, number, number],
  corridorFill: [...hexToRgb(MAP_COLORS.corridor), 150] as [number, number, number, number],
  route: [...hexToRgb(MAP_COLORS.route), 255] as [number, number, number, number],
  driver: [...hexToRgb(MAP_COLORS.driver), 255] as [number, number, number, number],
  pickup: [...hexToRgb(MAP_COLORS.ineligible), 180] as [number, number, number, number],
};

// Heatmap gradient (leaflet.heat).
export const HEAT_GRADIENT: Record<number, string> = {
  0.2: '#1e3a8a',
  0.4: '#2563eb',
  0.6: '#14b8a6',
  0.8: '#f59e0b',
  1.0: '#dc2626',
};
