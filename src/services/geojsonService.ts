import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import pointToLineDistance from '@turf/point-to-line-distance';
import { point } from '@turf/helpers';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { LngLat, ZoneCollection } from '@/types';
import { routeLine } from './routeService';

/** Exact narrow-phase test: is the point inside the corridor polygon? */
export function pointInPolygon(
  lng: number,
  lat: number,
  feature: Feature<Polygon | MultiPolygon>
): boolean {
  return booleanPointInPolygon(point([lng, lat]), feature);
}

/** Shortest distance (metres) from a point to the route polyline. */
export function distanceToRouteMeters(
  lng: number,
  lat: number,
  coords: LngLat[]
): number {
  return (
    pointToLineDistance(point([lng, lat]), routeLine(coords), {
      units: 'kilometers',
    }) * 1000
  );
}

/** Name of the first service zone containing the point, or null. */
export function zoneForPoint(
  lng: number,
  lat: number,
  zones: ZoneCollection
): string | null {
  const pt = point([lng, lat]);
  for (const f of zones.features) {
    if (booleanPointInPolygon(pt, f)) return f.properties.name;
  }
  return null;
}
