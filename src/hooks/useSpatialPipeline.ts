import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useActiveRoute } from './useActiveRoute';
import { CORRIDOR_SNAP_METERS, LOOK_BEHIND_METERS } from '@/constants/config';
import { sliceRoute } from '@/services/routeService';
import { cellsToLeafletHexes, type LeafletHex } from '@/services/h3Service';
import { zoneStats } from '@/services/pickupService';
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

interface WorkerResult {
  bufferFeature: Feature<Polygon | MultiPolygon> | null;
  cells: string[];
  pickups: ClassifiedPickup[];
  stats: PipelineStats;
}

const EMPTY_STATS: PipelineStats = {
  total: 0,
  candidates: 0,
  eligible: 0,
  rejected: 0,
  cellCount: 0,
  areaKm2: 0,
  routeKm: 0,
  processingMs: 0,
};

const EMPTY: WorkerResult = {
  bufferFeature: null,
  cells: [],
  pickups: [],
  stats: EMPTY_STATS,
};

/**
 * Derived spatial state. The heavy buffer -> H3 -> classification work runs in
 * a Web Worker (see workers/pipeline.worker.ts); the main thread only slices
 * the corridor (cheap) and renders. Recomputation is snapped to driver
 * movement so requests fire at most once per CORRIDOR_SNAP_METERS.
 */
export function useSpatialPipeline(): SpatialPipeline {
  const { coords, totalMeters } = useActiveRoute();
  const resolution = useStore((s) => s.resolution);
  const bufferMeters = useStore((s) => s.bufferMeters);
  const corridorMode = useStore((s) => s.corridorMode);
  const lookAheadMeters = useStore((s) => s.lookAheadMeters);
  const showH3 = useStore((s) => s.layers.h3);

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

  // --- Web Worker lifecycle ---
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const [res, setRes] = useState<WorkerResult>(EMPTY);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/pipeline.worker.ts', import.meta.url),
      { type: 'module' }
    );
    worker.onmessage = (e: MessageEvent<WorkerResult & { id: number }>) => {
      if (e.data.id !== reqId.current) return; // ignore stale results
      const { bufferFeature, cells, pickups, stats } = e.data;
      setRes({ bufferFeature, cells, pickups, stats });
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // Dispatch a recompute whenever the corridor or its parameters change.
  useEffect(() => {
    const id = ++reqId.current;
    workerRef.current?.postMessage({
      id,
      corridorCoords,
      bufferMeters,
      resolution,
      routeKm: totalMeters / 1000,
    });
  }, [corridorCoords, bufferMeters, resolution, totalMeters]);

  const cells = useMemo(() => new Set(res.cells), [res.cells]);
  const hexes = useMemo(
    () => (showH3 ? cellsToLeafletHexes(cells) : []),
    [cells, showH3]
  );
  const zones = useMemo(() => zoneStats(res.pickups, ZONES), [res.pickups]);

  return {
    coords,
    totalMeters,
    corridorCoords,
    bufferFeature: res.bufferFeature,
    cells,
    hexes,
    pickups: res.pickups,
    stats: res.stats,
    zones,
  };
}
