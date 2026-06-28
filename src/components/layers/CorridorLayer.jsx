import { Polygon } from 'react-leaflet';
import { toLatLngs } from '../../lib/geo.js';
import { COLORS } from '../../config/constants.js';

// Renders the 350 m buffer polygon (the corridor) as a translucent fill.
// Handles both Polygon and MultiPolygon outputs from Turf's buffer.
export default function CorridorLayer({ bufferFeature, visible }) {
  if (!visible || !bufferFeature) return null;

  const { type, coordinates } = bufferFeature.geometry;
  const polygons = type === 'MultiPolygon' ? coordinates : [coordinates];

  return (
    <>
      {polygons.map((rings, i) => (
        <Polygon
          key={i}
          positions={rings.map((ring) => toLatLngs(ring))}
          pathOptions={{
            color: COLORS.corridor,
            weight: 1.5,
            opacity: 0.9,
            fillColor: COLORS.corridor,
            fillOpacity: 0.12,
          }}
        />
      ))}
    </>
  );
}
