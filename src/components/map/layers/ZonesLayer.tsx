import { Polygon, Tooltip } from 'react-leaflet';
import { useStore } from '@/store/useStore';
import { ZONES } from '@/data/zones';
import { toLatLngs } from '@/utils/geometry';

export default function ZonesLayer() {
  const visible = useStore((s) => s.layers.zones);
  if (!visible) return null;
  return (
    <>
      {ZONES.features.map((f) => (
        <Polygon
          key={f.properties.id}
          positions={toLatLngs(f.geometry.coordinates[0] as [number, number][])}
          pathOptions={{
            color: f.properties.color,
            weight: 1.5,
            dashArray: '7 7',
            fillColor: f.properties.color,
            fillOpacity: 0.05,
          }}
        >
          <Tooltip sticky>
            <span className="font-semibold">{f.properties.name}</span>
            <span className="text-muted"> · {f.properties.type}</span>
          </Tooltip>
        </Polygon>
      ))}
    </>
  );
}
