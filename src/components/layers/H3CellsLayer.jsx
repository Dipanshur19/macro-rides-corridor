import { Polygon } from 'react-leaflet';
import { COLORS } from '../../config/constants.js';

// Optional overlay: the actual H3 cells that make up the corridor index.
// This visualises *how* eligibility is computed (the spatial index itself).
export default function H3CellsLayer({ hexes, visible }) {
  if (!visible || !hexes.length) return null;
  return (
    <>
      {hexes.map((h) => (
        <Polygon
          key={h.id}
          positions={h.latlngs}
          pathOptions={{
            color: COLORS.h3,
            weight: 0.5,
            opacity: 0.5,
            fillColor: COLORS.h3,
            fillOpacity: 0.05,
          }}
          interactive={false}
        />
      ))}
    </>
  );
}
