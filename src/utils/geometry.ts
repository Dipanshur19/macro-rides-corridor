import type { LatLng, LngLat } from '@/types';

/** [lng, lat] -> [lat, lng] for Leaflet. */
export const toLatLng = ([lng, lat]: LngLat): LatLng => [lat, lng];

/** [[lng, lat], ...] -> [[lat, lng], ...] for Leaflet. */
export const toLatLngs = (coords: LngLat[]): LatLng[] => coords.map(toLatLng);

/** Initial bearing (degrees, 0 = north) from point a to b, both [lng, lat]. */
export function bearing(a: LngLat, b: LngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
