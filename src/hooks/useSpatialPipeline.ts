import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useActiveRoute } from './useActiveRoute';
import { CORRIDOR_SNAP_METERS, LOOK_BEHIND_METERS } from '@/constants/config';
import { sliceRoute } from '@/services/routeService';
import { bufferRoute } from '@/services/bufferService';
import {
  polygonFeatureToCells,
  corridorAreaKm2,
  cellsToLeafletHexes,
  type LeafletHex,
} from '@/services/h3Service';
import { classifyPickups, zoneStats } from '@/services/pickupService';
import { PICKUPS } from '@/data/pickups';
import { ZONES } from '@/data/zones';
import type {
  ClassifiedPickup,
  LngLat,
  PipelineStats,
  ZoneStat,
} from '@/types';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

export interface SpatialPipeline {
  coords: LngLat[];
  totalMeters: number;
  corridorCoords: LngLat[];
  bufferFeature: Feature<Polygon | MultiPolygon> | null;
  cells: Set<string>;
  hexes: LeafletHex[];
  pickups: ClassifiedPickup[];
  stats: PipelineStats;
  zones: ZoneStat[];
}

/**
 * The full derived spatial state. Heavy work (buffer -> H3 cells -> two-phase
 * pickup classification) is recomputed only when settings change or the driver
 * has moved a snapped step (CORRIDOR_SNAP_METERS), never on every frame.
 */
export function useSpatialPipeline(): SpatialPipeline {
  const { coords, totalMeters } = useActiveRoute();
  const resolution = useStore((s) => s.resolution);
  const bufferMeters = useStore((s) => s.bufferMeters);
  const corridorMode = useStore((s) => s.corridorMode);
  const lookAheadMeters = useStore((s) => s.lookAheadMeters);
  const showH3 = useStore((s) => s.layers.h3);

  // Snapped progress: this selector returns the same value for ~25 m of travel,
  // so the heavy memos below do not recompute every animation frame.
  const snapped = useStore(
    (s) =>
      Math.round(s.progressMeters / CORRIDOR_SNAP_METERS) * CORRIDOR_SNAP_METERS
  );

  const corridorCoords = useMemo<LngLat[]>(() => {
    if (coords.length < 2) return coords;
    if (corridorMode === 'full') return coords;
    const start = Math.max(0, snapped - LOOK_BEHIND_METERS);
    const end = snapped + lookAheadMeters;
    return sliceRoute(coords, start, end);
  }, [coords, corridorMode, snapped, lookAheadMeters]);

  const { bufferFeature, cells } = useMemo(() => {
    const bf = bufferRoute(corridorCoords, bufferMeters);
    const cs = bf ? polygonFeatureToCells(bf, resolution) : new Set<string>();
    return { bufferFeature: bf, cells: cs };
  }, [corridorCoords, bufferMeters, resolution]);

  const areaKm2 = useMemo(() => corridorAreaKm2(cells), [cells]);

  const { pickups, stats } = useMemo(
    () =>
      classifyPickups({
        points: PICKUPS,
        cells,
        bufferFeature,
        resolution,
        routeCoords: corridorCoords,
        zones: ZONES,
        cellCount: cells.size,
        areaKm2,
        routeKm: totalMeters / 1000,
      }),
    [cells, bufferFeature, resolution, corridorCoords, areaKm2, totalMeters]
  );

  const zones = useMemo(() => zoneStats(pickups, ZONES), [pickups]);

  const hexes = useMemo(
    () => (showH3 ? cellsToLeafletHexes(cells) : []),
    [cells, showH3]
  );

  return {
    coords,
    totalMeters,
    corridorCoords,
    bufferFeature,
    cells,
    hexes,
    pickups,
    stats,
    zones,
  };
}
