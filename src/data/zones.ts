import type { ZoneCollection } from '@/types';

// Operational service zones across the NCR demo area (GeoJSON, [lng, lat]).
function rect(
  id: string,
  name: string,
  type: string,
  color: string,
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number
) {
  return {
    type: 'Feature' as const,
    properties: { id, name, type, color },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat],
        ],
      ],
    },
  };
}

export const ZONES: ZoneCollection = {
  type: 'FeatureCollection',
  features: [
    rect('Z-CD', 'Central Delhi', 'Business', '#7c3aed', 77.188, 28.596, 77.243, 28.642),
    rect('Z-SD', 'South Delhi', 'Residential', '#2563eb', 77.178, 28.512, 77.232, 28.578),
    rect('Z-SE', 'South-East (Nehru Place)', 'Mixed', '#0ea5e9', 77.236, 28.532, 77.282, 28.586),
    rect('Z-WA', 'West / Airport', 'Airport', '#f59e0b', 77.038, 28.536, 77.142, 28.612),
  ],
};
