import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { useStore } from '@/store/useStore';
import { HEAT_GRADIENT } from '@/constants/palette';
import { PICKUPS } from '@/data/pickups';

/** Pickup-demand density heatmap (leaflet.heat). */
export default function HeatmapLayer() {
  const map = useMap();
  const visible = useStore((s) => s.layers.heatmap);

  useEffect(() => {
    if (!visible) return;
    const points = PICKUPS.map((p) => [p.lat, p.lng, 0.6]) as [number, number, number][];
    const layer = (L as typeof L & { heatLayer: Function }).heatLayer(points, {
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
