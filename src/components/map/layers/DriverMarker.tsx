import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '@/store/useStore';
import { pointAtDistance } from '@/services/routeService';
import type { LngLat } from '@/types';

// Car marker (emoji) with a pulsing ring. Created once; only its position moves.
const driverIcon = L.divIcon({
  className: '',
  html:
    '<div class="driver-marker"><span class="ring"></span>' +
    '<span class="core" style="font-size:16px;background:rgb(var(--c-primary));">\uD83D\uDE97</span></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function DriverMarker({ coords }: { coords: LngLat[] }) {
  const progress = useStore((s) => s.progressMeters);
  const drawing = useStore((s) => s.drawing);

  const pos = useMemo(
    () => (coords.length >= 2 ? pointAtDistance(coords, progress) : null),
    [coords, progress]
  );

  if (drawing || !pos) return null;
  return <Marker position={[pos[1], pos[0]]} icon={driverIcon} zIndexOffset={1000} />;
}
