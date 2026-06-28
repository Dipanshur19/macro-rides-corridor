// ---------------------------------------------------------------------------
// H3 spatial engine — the heart of the assignment.
//
// Strategy (production-grade pattern):
//   1. Buffer the driver's route by 350 m  ->  corridor polygon (Turf).
//   2. Convert that polygon into the SET of H3 cells covering it
//      (h3.polygonToCells)  ->  this is our spatial INDEX of the corridor.
//   3. A pickup point is ELIGIBLE if the H3 cell it lives in
//      (h3.latLngToCell) is a member of the corridor cell-set.
//      This membership test is an O(1) hash lookup, so it scales to
//      millions of points / many drivers — far better than an O(n) distance
//      scan against every point.
//   4. We additionally compute the exact perpendicular distance to the route
//      (Turf) purely for display & accuracy verification.
// ---------------------------------------------------------------------------

import {
  polygonToCells,
  latLngToCell,
  cellToBoundary,
  cellArea,
  UNITS,
} from 'h3-js';

import { bufferRoute, distanceToRouteMeters, zoneForPoint } from './geo.js';

/**
 * Convert a (Multi)Polygon GeoJSON feature into a Set of H3 cell indexes.
 * h3-js v4: polygonToCells(coordinates, res, isGeoJSON=true) expects
 * [lng, lat] order when isGeoJSON is true — which is exactly GeoJSON order.
 */
export function polygonFeatureToCells(feature, resolution) {
  const cells = new Set();
  const { type, coordinates } = feature.geometry;

  const addPolygon = (polygonCoords) => {
    // polygonCoords = [outerRing, hole1, hole2, ...] in [lng, lat]
    for (const c of polygonToCells(polygonCoords, resolution, true)) {
      cells.add(c);
    }
  };

  if (type === 'Polygon') {
    addPolygon(coordinates);
  } else if (type === 'MultiPolygon') {
    for (const poly of coordinates) addPolygon(poly);
  }
  return cells;
}

/**
 * Build the corridor for a set of route coordinates.
 * Returns the buffer polygon (for fill rendering) and the H3 cell index Set.
 */
export function buildCorridor(routeCoords, { bufferMeters, resolution }) {
  const bufferFeature = bufferRoute(routeCoords, bufferMeters);
  const cells = bufferFeature
    ? polygonFeatureToCells(bufferFeature, resolution)
    : new Set();
  return { bufferFeature, cells };
}

/**
 * Classify pickup points against the corridor cell-set.
 * The eligibility decision is the H3 membership test (the spatial query);
 * distance & zone are computed for transparency / verification.
 */
export function classifyPickups(points, { cells, resolution, routeCoords, zones }) {
  return points.map((p) => {
    const cell = latLngToCell(p.lat, p.lng, resolution);
    const eligible = cells.has(cell);
    return {
      ...p,
      cell,
      eligible,
      distanceMeters: Math.round(distanceToRouteMeters(p.lng, p.lat, routeCoords)),
      zone: zones ? zoneForPoint(p.lng, p.lat, zones) : null,
    };
  });
}

/**
 * Convert a corridor cell-set into Leaflet-ready hexagon outlines
 * ([lat, lng][] per cell) for the optional H3 grid overlay.
 * Capped to avoid rendering tens of thousands of polygons at high resolution.
 */
export function cellsToLeafletHexes(cells, cap = 4000) {
  const out = [];
  let i = 0;
  for (const cell of cells) {
    if (i++ >= cap) break;
    // cellToBoundary(cell) -> [[lat, lng], ...]  (Leaflet order by default)
    out.push({ id: cell, latlngs: cellToBoundary(cell) });
  }
  return out;
}

/** Approximate total corridor area (km^2) from its cell count. */
export function corridorAreaKm2(cells, resolution) {
  if (cells.size === 0) return 0;
  // All cells at a resolution have ~equal area; sample one for efficiency.
  const sample = cells.values().next().value;
  const areaKm2 = cellArea(sample, UNITS.km2);
  return cells.size * areaKm2;
}
