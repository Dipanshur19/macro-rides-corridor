// ---------------------------------------------------------------------------
// Geometry helpers (Turf.js).
// All functions take/return GeoJSON [lng, lat] order, EXCEPT the explicit
// `toLatLng(s)` converters used at the Leaflet rendering boundary.
// Distances are computed in kilometres internally and exposed in metres.
// ---------------------------------------------------------------------------

import { lineString, point } from '@turf/helpers';
import buffer from '@turf/buffer';
import turfLength from '@turf/length';
import along from '@turf/along';
import lineSliceAlong from '@turf/line-slice-along';
import pointToLineDistance from '@turf/point-to-line-distance';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const KM = 'kilometers';

/** [lng, lat] -> [lat, lng] for Leaflet. */
export const toLatLng = ([lng, lat]) => [lat, lng];

/** [[lng, lat], ...] -> [[lat, lng], ...] for Leaflet. */
export const toLatLngs = (coords) => coords.map(toLatLng);

/** Build a Turf LineString from a route's [lng, lat] coordinates. */
export const routeLine = (coords) => lineString(coords);

/** Total route length in metres. */
export const routeLengthMeters = (coords) =>
  turfLength(routeLine(coords), { units: KM }) * 1000;

/** Position [lng, lat] at a given distance (metres) along the route. */
export function pointAtDistance(coords, meters) {
  const total = routeLengthMeters(coords);
  const d = Math.max(0, Math.min(meters, total));
  return along(routeLine(coords), d / 1000, { units: KM }).geometry.coordinates;
}

/**
 * Slice a sub-route between two distances (metres) along the route.
 * Returns [lng, lat][] — used to build the dynamic look-ahead corridor.
 */
export function sliceRoute(coords, startMeters, endMeters) {
  const total = routeLengthMeters(coords);
  const start = Math.max(0, Math.min(startMeters, total));
  const end = Math.max(start + 1, Math.min(endMeters, total));
  const sliced = lineSliceAlong(routeLine(coords), start / 1000, end / 1000, {
    units: KM,
  });
  return sliced.geometry.coordinates;
}

/**
 * Buffer a LineString (the route) by `meters` on each side -> corridor polygon.
 * `steps` controls the smoothness of the rounded end-caps.
 */
export function bufferRoute(coords, meters, steps = 16) {
  return buffer(routeLine(coords), meters / 1000, { units: KM, steps });
}

/** Shortest distance (metres) from a [lng, lat] point to the route polyline. */
export function distanceToRouteMeters(lng, lat, coords) {
  return (
    pointToLineDistance(point([lng, lat]), routeLine(coords), { units: KM }) *
    1000
  );
}

/** Name of the first zone containing the point, or null. */
export function zoneForPoint(lng, lat, zonesFeatureCollection) {
  const pt = point([lng, lat]);
  for (const f of zonesFeatureCollection.features) {
    if (booleanPointInPolygon(pt, f)) return f.properties.name;
  }
  return null;
}
