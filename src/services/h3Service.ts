import {
  polygonToCells,
  latLngToCell,
  cellToBoundary,
  cellToLatLng,
  cellArea,
  gridDisk,
  getResolution,
  UNITS,
} from 'h3-js';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { LatLng } from '@/types';

/** Map a coordinate to its H3 cell at a resolution. */
export const cellFor = (lat: number, lng: number, res: number): string =>
  latLngToCell(lat, lng, res);

/**
 * Convert a (Multi)Polygon into the Set of H3 cells covering it.
 * h3-js v4: polygonToCells(coords, res, isGeoJSON=true) expects [lng, lat].
 */
export function polygonFeatureToCells(
  feature: Feature<Polygon | MultiPolygon>,
  resolution: number
): Set<string> {
  const cells = new Set<string>();
  const geom = feature.geometry;

  const add = (rings: number[][][]) => {
    for (const c of polygonToCells(rings, resolution, true)) cells.add(c);
  };

  if (geom.type === 'Polygon') {
    add(geom.coordinates as number[][][]);
  } else {
    for (const poly of geom.coordinates as number[][][][]) add(poly);
  }
  return cells;
}

/** cellToBoundary returns [lat, lng] pairs by default - ready for Leaflet. */
export const cellBoundaryLatLng = (cell: string): LatLng[] =>
  cellToBoundary(cell) as LatLng[];

export interface LeafletHex {
  id: string;
  latlngs: LatLng[];
}

export function cellsToLeafletHexes(
  cells: Iterable<string>,
  cap = 6000
): LeafletHex[] {
  const out: LeafletHex[] = [];
  let i = 0;
  for (const cell of cells) {
    if (i++ >= cap) break;
    out.push({ id: cell, latlngs: cellBoundaryLatLng(cell) });
  }
  return out;
}

export function corridorAreaKm2(cells: Set<string>): number {
  if (cells.size === 0) return 0;
  const sample = cells.values().next().value as string;
  return cells.size * cellArea(sample, UNITS.km2);
}

export interface CellInspection {
  index: string;
  resolution: number;
  areaKm2: number;
  center: LatLng;
  boundary: LatLng[];
  neighbors: string[];
}

/** Rich info for the H3 Inspector panel. */
export function inspectCell(cell: string): CellInspection {
  return {
    index: cell,
    resolution: getResolution(cell),
    areaKm2: cellArea(cell, UNITS.km2),
    center: cellToLatLng(cell) as LatLng,
    boundary: cellBoundaryLatLng(cell),
    neighbors: gridDisk(cell, 1).filter((c) => c !== cell),
  };
}
