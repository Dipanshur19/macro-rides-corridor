// ---------------------------------------------------------------------------
// Operational service zones (a real EV-mobility business divides a city into
// these for supply/demand balancing, surge, and serviceability rules).
// Stored as a GeoJSON FeatureCollection (polygons in [lng, lat]).
// ---------------------------------------------------------------------------

export const ZONES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'Z-N', name: 'North · Indiranagar', color: '#7c8cff' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.6256, 12.9452],
            [77.6498, 12.9452],
            [77.6498, 12.9602],
            [77.6256, 12.9602],
            [77.6256, 12.9452],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'Z-C', name: 'Central · Koramangala', color: '#56c2ff' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.6042, 12.9262],
            [77.6342, 12.9262],
            [77.6342, 12.9452],
            [77.6042, 12.9452],
            [77.6042, 12.9262],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'Z-S', name: 'South · HSR Layout', color: '#ffa94d' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.6262, 12.9082],
            [77.6512, 12.9082],
            [77.6512, 12.9282],
            [77.6262, 12.9282],
            [77.6262, 12.9082],
          ],
        ],
      },
    },
  ],
};
