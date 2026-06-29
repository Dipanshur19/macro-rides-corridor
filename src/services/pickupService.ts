import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type {
  ClassifiedPickup,
  LngLat,
  PickupPoint,
  PipelineStats,
  ZoneCollection,
  ZoneStat,
} from '@/types';
import { cellFor } from './h3Service';
import { pointInPolygon, distanceToRouteMeters, zoneForPoint } from './geojsonService';

export interface ClassifyInput {
  points: PickupPoint[];
  cells: Set<string>;
  bufferFeature: Feature<Polygon | MultiPolygon> | null;
  resolution: number;
  routeCoords: LngLat[];
  zones: ZoneCollection;
  cellCount: number;
  areaKm2: number;
  routeKm: number;
}

export interface ClassifyResult {
  pickups: ClassifiedPickup[];
  stats: PipelineStats;
}

/**
 * Two-phase spatial filter:
 *   Broad-phase  -> O(1) H3 membership test (latLngToCell in corridor set).
 *   Narrow-phase -> exact point-in-polygon against the 350 m buffer.
 * Only candidates that pass broad-phase pay for the (costlier) exact test,
 * which is the production pattern for scaling to millions of points.
 */
export function classifyPickups(input: ClassifyInput): ClassifyResult {
  const { points, cells, bufferFeature, resolution, routeCoords, zones } = input;

  const t0 = performance.now();
  let candidates = 0;
  let eligible = 0;

  const pickups: ClassifiedPickup[] = points.map((p) => {
    const cell = cellFor(p.lat, p.lng, resolution);
    const candidate = cells.has(cell);
    let isEligible = false;
    if (candidate) {
      candidates++;
      isEligible = bufferFeature
        ? pointInPolygon(p.lng, p.lat, bufferFeature)
        : false;
      if (isEligible) eligible++;
    }
    return {
      ...p,
      cell,
      candidate,
      eligible: isEligible,
      distanceMeters: Math.round(
        distanceToRouteMeters(p.lng, p.lat, routeCoords)
      ),
      zone: zoneForPoint(p.lng, p.lat, zones),
    };
  });

  const processingMs = performance.now() - t0;

  const stats: PipelineStats = {
    total: points.length,
    candidates,
    eligible,
    rejected: points.length - eligible,
    cellCount: input.cellCount,
    areaKm2: input.areaKm2,
    routeKm: input.routeKm,
    processingMs,
  };

  return { pickups, stats };
}

/** Aggregate eligible/total pickups per service zone for the analytics panel. */
export function zoneStats(
  pickups: ClassifiedPickup[],
  zones: ZoneCollection
): ZoneStat[] {
  const map = new Map<string, ZoneStat>();
  for (const f of zones.features) {
    map.set(f.properties.name, {
      id: f.properties.id,
      name: f.properties.name,
      color: f.properties.color,
      total: 0,
      eligible: 0,
    });
  }
  for (const p of pickups) {
    if (!p.zone) continue;
    const z = map.get(p.zone);
    if (!z) continue;
    z.total++;
    if (p.eligible) z.eligible++;
  }
  return [...map.values()];
}
