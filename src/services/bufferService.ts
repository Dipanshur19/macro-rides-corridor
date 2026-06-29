import buffer from '@turf/buffer';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { LngLat } from '@/types';
import { routeLine } from './routeService';

/**
 * Buffer the route LineString by `meters` on each side -> corridor polygon.
 * `steps` controls the smoothness of the rounded end-caps.
 */
export function bufferRoute(
  coords: LngLat[],
  meters: number,
  steps = 16
): Feature<Polygon | MultiPolygon> | null {
  if (coords.length < 2) return null;
  const result = buffer(routeLine(coords), meters / 1000, {
    units: 'kilometers',
    steps,
  });
  return (result ?? null) as Feature<Polygon | MultiPolygon> | null;
}
