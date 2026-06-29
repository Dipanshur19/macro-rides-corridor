import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '@/store/useStore';
import { pointAtDistance } from '@/services/routeService';
import { bearing } from '@/utils/geometry';
import type { LngLat } from '@/types';

function makeIcon(angle: number) {
  return L.divIcon({
    className: '',
    html: `<div class="driver-marker"><span class="ring"></span><span class="core" style="transform:rotate(${angle}deg)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    </span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/** Live driver marker. Subscribes only to raw progress for smooth movement. */
export default function DriverMarker({ coords }: { coords: LngLat[] }) {
  const progress = useStore((s) => s.progressMeters);
  const drawing = useStore((s) => s.drawing);

  const { pos, angle } = useMemo(() => {
    if (coords.length < 2) return { pos: null as LngLat | null, angle: 0 };
    const here = pointAtDistance(coords, progress);
    const ahead = pointAtDistance(coords, Math.min(progress + 12, Infinity));
    return { pos: here, angle: bearing(here, ahead) };
  }, [coords, progress]);

  if (drawing || !pos) return null;
  return <Marker position={[pos[1], pos[0]]} icon={makeIcon(angle)} zIndexOffset={1000} />;
}
