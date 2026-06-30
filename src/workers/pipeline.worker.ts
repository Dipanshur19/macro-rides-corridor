/// <reference lib="webworker" />
// ---------------------------------------------------------------------------
// Off-main-thread spatial pipeline.
// Runs the heavy work (Turf buffer -> H3 polygonToCells -> two-phase pickup
// classification) inside a Web Worker so the main thread stays at 60 FPS even
// with large pickup datasets. Only the latest request id is honoured.
// ---------------------------------------------------------------------------
import { bufferRoute } from '../services/bufferService';
import { polygonFeatureToCells, corridorAreaKm2 } from '../services/h3Service';
import { classifyPickups } from '../services/pickupService';
import { PICKUPS } from '../data/pickups';
import { ZONES } from '../data/zones';
import type { LngLat } from '../types';

interface PipelineRequest {
  id: number;
  corridorCoords: LngLat[];
  bufferMeters: number;
  resolution: number;
  routeKm: number;
}

self.onmessage = (e: MessageEvent<PipelineRequest>) => {
  const { id, corridorCoords, bufferMeters, resolution, routeKm } = e.data;

  const bufferFeature =
    corridorCoords.length >= 2 ? bufferRoute(corridorCoords, bufferMeters) : null;
  const cells = bufferFeature
    ? polygonFeatureToCells(bufferFeature, resolution)
    : new Set<string>();
  const areaKm2 = corridorAreaKm2(cells);

  const { pickups, stats } = classifyPickups({
    points: PICKUPS,
    cells,
    bufferFeature,
    resolution,
    routeCoords: corridorCoords,
    zones: ZONES,
    cellCount: cells.size,
    areaKm2,
    routeKm,
  });

  (self as DedicatedWorkerGlobalScope).postMessage({
    id,
    bufferFeature,
    cells: [...cells],
    pickups,
    stats,
  });
};
