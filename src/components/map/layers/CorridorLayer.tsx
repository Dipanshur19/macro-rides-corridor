import { Polygon } from 'react-leaflet';
import { useStore } from '@/store/useStore';
import { MAP_COLORS } from '@/constants/palette';
import { toLatLngs } from '@/utils/geometry';
import type { Feature, Polygon as GeoPolygon, MultiPolygon } from 'geojson';
import type { LngLat } from '@/types';

export default function CorridorLayer({
  bufferFeature,
}: {
  bufferFeature: Feature<GeoPolygon | MultiPolygon> | null;
}) {
  const visible = useStore((s) => s.layers.corridor);
  if (!visible || !bufferFeature) return null;

  const geom = bufferFeature.geometry;
  const polygons =
    geom.type === 'MultiPolygon'
      ? (geom.coordinates as number[][][][])
      : [geom.coordinates as number[][][]];

  return (
    <>
      {polygons.map((rings, i) => (
        <Polygon
          key={i}
          positions={rings.map((ring) => toLatLngs(ring as LngLat[]))}
          pathOptions={{
            color: MAP_COLORS.corridor,
            weight: 1.5,
            opacity: 0.9,
            fillColor: MAP_COLORS.corridor,
            fillOpacity: 0.12,
          }}
          interactive={false}
        />
      ))}
    </>
  );
}
