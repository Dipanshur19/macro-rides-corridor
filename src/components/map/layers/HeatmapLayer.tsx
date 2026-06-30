import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { useStore } from '@/store/useStore';
import { HEAT_GRADIENT } from '@/constants/palette';
import { PICKUPS } from '@/data/pickups';

type HeatPoint = [number, number, number];
type HeatLayerFn = (points: HeatPoint[], options?: Record<string, unknown>) => L.Layer;

/** Pickup-demand density heatmap (leaflet.heat). */
export default function HeatmapLayer() {
  const map = useMap();
  const visible = useStore((s) => s.layers.heatmap);

  useEffect(() => {
    if (!visible) return;
    const points: HeatPoint[] = PICKUPS.map((p) => [p.lat, p.lng, 0.6]);
    const heatLayer = (L as unknown as { heatLayer: HeatLayerFn }).heatLayer;
    const layer = heatLayer(points, {
      radius: 26,
      blur: 20,
      maxZoom: 17,
      gradient: HEAT_GRADIENT,
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [visible, map]);

  return null;
}
