import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useSimulation } from '@/hooks/useSimulation';
import { useSpatialPipeline } from '@/hooks/useSpatialPipeline';
import { useEventFeed } from '@/hooks/useEventFeed';
import { CORRIDOR_SNAP_METERS } from '@/constants/config';
import { pointAtDistance } from '@/services/routeService';
import { zoneForPoint } from '@/services/geojsonService';
import { ZONES } from '@/data/zones';

import Header from '@/components/header/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import MapArea from '@/components/map/MapArea';

export default function Dashboard() {
  useSimulation();
  const pipeline = useSpatialPipeline();

  const snapped = useStore(
    (s) =>
      Math.round(s.progressMeters / CORRIDOR_SNAP_METERS) * CORRIDOR_SNAP_METERS
  );

  const driverZone = useMemo(() => {
    if (pipeline.coords.length < 2) return null;
    const [lng, lat] = pointAtDistance(pipeline.coords, snapped);
    return zoneForPoint(lng, lat, ZONES);
  }, [pipeline.coords, snapped]);

  useEventFeed(pipeline.stats.eligible, driverZone);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg text-text">
      <Header processingMs={pipeline.stats.processingMs} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar pipeline={pipeline} driverZone={driverZone} />
        <MapArea pipeline={pipeline} />
      </div>
    </div>
  );
}
