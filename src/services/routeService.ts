import { lineString } from '@turf/helpers';
import turfLength from '@turf/length';
import along from '@turf/along';
import lineSliceAlong from '@turf/line-slice-along';
import type { Feature, LineString } from 'geojson';
import type { LngLat } from '@/types';

const KM = 'kilometers' as const;

export const routeLine = (coords: LngLat[]): Feature<LineString> =>
  lineString(coords);

export const routeLengthMeters = (coords: LngLat[]): number =>
  turfLength(routeLine(coords), { units: KM }) * 1000;

/** Interpolated position [lng, lat] at `meters` along the route. */
export function pointAtDistance(coords: LngLat[], meters: number): LngLat {
  const total = routeLengthMeters(coords);
  const d = Math.max(0, Math.min(meters, total));
  return along(routeLine(coords), d / 1000, { units: KM }).geometry
    .coordinates as LngLat;
}

/** Sub-route between two distances (metres). Used for the dynamic corridor. */
export function sliceRoute(
  coords: LngLat[],
  startMeters: number,
  endMeters: number
): LngLat[] {
  const total = routeLengthMeters(coords);
  const start = Math.max(0, Math.min(startMeters, total));
  const end = Math.max(start + 1, Math.min(endMeters, total));
  const sliced = lineSliceAlong(routeLine(coords), start / 1000, end / 1000, {
    units: KM,
  });
  return sliced.geometry.coordinates as LngLat[];
}
