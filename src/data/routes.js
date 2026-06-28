// ---------------------------------------------------------------------------
// Preset driver routes.
// Coordinates are stored in GeoJSON order: [lng, lat]. This is the canonical
// order used by Turf and by H3's GeoJSON mode, which keeps the spatial engine
// free of lat/lng confusion. Conversion to Leaflet's [lat, lng] happens only
// at the rendering boundary (see lib/geo.js -> toLatLngs).
// ---------------------------------------------------------------------------

export const PRESET_ROUTES = [
  {
    id: 'kormangala-indiranagar',
    name: 'Koramangala → Indiranagar',
    coordinates: [
      [77.6101, 12.9279],
      [77.6142, 12.9301],
      [77.6189, 12.9324],
      [77.6231, 12.9352],
      [77.6258, 12.9389],
      [77.6271, 12.9436],
      [77.6299, 12.9478],
      [77.6345, 12.9512],
      [77.6402, 12.9538],
      [77.6451, 12.9561],
    ],
  },
  {
    id: 'ring-road-run',
    name: 'Outer Ring Road Run',
    coordinates: [
      [77.6021, 12.9221],
      [77.6088, 12.9239],
      [77.6155, 12.9258],
      [77.6223, 12.9282],
      [77.6288, 12.9319],
      [77.6331, 12.9372],
      [77.6352, 12.9431],
      [77.6339, 12.9489],
      [77.6298, 12.9531],
    ],
  },
  {
    id: 'hsr-loop',
    name: 'HSR Sector Loop',
    coordinates: [
      [77.6371, 12.9121],
      [77.6418, 12.9148],
      [77.6452, 12.9192],
      [77.6461, 12.9248],
      [77.6438, 12.9298],
      [77.6389, 12.9329],
      [77.6332, 12.9341],
      [77.6281, 12.9332],
    ],
  },
];

export const DEFAULT_ROUTE_ID = PRESET_ROUTES[0].id;

export function getRouteById(id) {
  return PRESET_ROUTES.find((r) => r.id === id) ?? PRESET_ROUTES[0];
}
