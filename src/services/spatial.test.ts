import { describe, it, expect } from 'vitest';
import { ROUTES } from '@/data/routes';
import { PICKUPS } from '@/data/pickups';
import { ZONES } from '@/data/zones';
import { routeLengthMeters } from '@/services/routeService';
import { bufferRoute } from '@/services/bufferService';
import { polygonFeatureToCells, corridorAreaKm2, inspectCell } from '@/services/h3Service';
import { classifyPickups } from '@/services/pickupService';

const route = ROUTES[0].coordinates;

function runPipeline(resolution = 10, bufferMeters = 350) {
  const bufferFeature = bufferRoute(route, bufferMeters)!;
  const cells = polygonFeatureToCells(bufferFeature, resolution);
  const { pickups, stats } = classifyPickups({
    points: PICKUPS,
    cells,
    bufferFeature,
    resolution,
    routeCoords: route,
    zones: ZONES,
    cellCount: cells.size,
    areaKm2: corridorAreaKm2(cells),
    routeKm: routeLengthMeters(route) / 1000,
  });
  return { bufferFeature, cells, pickups, stats };
}

describe('corridor construction', () => {
  it('produces a non-empty 350 m buffer polygon', () => {
    const bf = bufferRoute(route, 350);
    expect(bf).toBeTruthy();
    expect(['Polygon', 'MultiPolygon']).toContain(bf!.geometry.type);
  });

  it('rasterises the corridor into H3 cells', () => {
    const { cells } = runPipeline();
    expect(cells.size).toBeGreaterThan(0);
  });

  it('uses finer resolution => more cells covering the same corridor', () => {
    const c10 = polygonFeatureToCells(bufferRoute(route, 350)!, 10).size;
    const c11 = polygonFeatureToCells(bufferRoute(route, 350)!, 11).size;
    expect(c11).toBeGreaterThan(c10);
  });
});

describe('two-phase pickup eligibility', () => {
  it('classifies every pickup exactly once', () => {
    const { stats } = runPipeline();
    expect(stats.total).toBe(PICKUPS.length);
  });

  it('eligible is always a subset of H3 candidates', () => {
    const { stats } = runPipeline();
    expect(stats.candidates).toBeGreaterThanOrEqual(stats.eligible);
  });

  it('every eligible pickup is within the 350 m buffer distance', () => {
    const { pickups } = runPipeline(10, 350);
    for (const p of pickups) {
      if (p.eligible) {
        // exact narrow-phase guarantees within buffer (+ small numeric margin)
        expect(p.distanceMeters).toBeLessThanOrEqual(355);
      }
    }
  });

  it('a wider buffer never reduces the eligible count', () => {
    const narrow = runPipeline(10, 200).stats.eligible;
    const wide = runPipeline(10, 600).stats.eligible;
    expect(wide).toBeGreaterThanOrEqual(narrow);
  });
});

describe('H3 inspector', () => {
  it('returns coherent metadata for a corridor cell', () => {
    const { cells } = runPipeline();
    const cell = cells.values().next().value as string;
    const info = inspectCell(cell);
    expect(info.resolution).toBe(10);
    expect(info.neighbors.length).toBeGreaterThan(0);
    expect(info.areaKm2).toBeGreaterThan(0);
  });
});
