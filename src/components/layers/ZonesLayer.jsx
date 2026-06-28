import { Polygon, Tooltip } from 'react-leaflet';
import { toLatLngs } from '../../lib/geo.js';

// Operational service-zone boundaries (dashed outlines).
export default function ZonesLayer({ zones, visible }) {
  if (!visible) return null;
  return (
    <>
      {zones.features.map((f) => {
        const ring = toLatLngs(f.geometry.coordinates[0]);
        return (
          <Polygon
            key={f.properties.id}
            positions={ring}
            pathOptions={{
              color: f.properties.color,
              weight: 1.5,
              dashArray: '6 6',
              fillOpacity: 0.04,
              fillColor: f.properties.color,
            }}
          >
            <Tooltip sticky>{f.properties.name}</Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
