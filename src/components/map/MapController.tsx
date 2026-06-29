import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '@/store/useStore';
import { toLatLngs } from '@/utils/geometry';
import type { LngLat } from '@/types';

/** Fits the map to the active route and wires draw-mode clicks. */
export default function MapController({ coords }: { coords: LngLat[] }) {
  const map = useMap();
  const drawing = useStore((s) => s.drawing);
  const addDraftPoint = useStore((s) => s.addDraftPoint);
  const routeId = useStore((s) => s.routeId);

  useEffect(() => {
    if (drawing || coords.length < 2) return;
    map.fitBounds(L.latLngBounds(toLatLngs(coords)), { padding: [70, 70] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, drawing]);

  useMapEvents({
    click(e) {
      if (drawing) addDraftPoint([e.latlng.lng, e.latlng.lat]);
    },
  });

  return null;
}
