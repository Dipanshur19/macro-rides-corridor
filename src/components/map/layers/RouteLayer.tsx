import { useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import { useStore } from '@/store/useStore';
import { MAP_COLORS } from '@/constants/palette';
import { toLatLngs } from '@/utils/geometry';
import { sliceRoute } from '@/services/routeService';
import type { LngLat } from '@/types';

export default function RouteLayer({ coords }: { coords: LngLat[] }) {
  const visible = useStore((s) => s.layers.route);
  // Snapped traveled segment for the brighter "progress" overlay.
  const snapped = useStore((s) => Math.round(s.progressMeters / 25) * 25);

  const traveled = useMemo(() => {
    if (snapped < 25 || coords.length < 2) return null;
    return sliceRoute(coords, 0, snapped);
  }, [coords, snapped]);

  if (!visible || coords.length < 2) return null;
  return (
    <>
      <Polyline
        positions={toLatLngs(coords)}
        pathOptions={{ color: MAP_COLORS.route, weight: 4, opacity: 0.4 }}
      />
      {traveled && traveled.length > 1 && (
        <Polyline
          positions={toLatLngs(traveled)}
          pathOptions={{ color: MAP_COLORS.routeTraveled, weight: 5, opacity: 0.95 }}
        />
      )}
    </>
  );
}
