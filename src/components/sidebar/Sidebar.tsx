import RouteControl from './RouteControl';
import SimulationControl from '@/components/controls/SimulationControl';
import DriverStatus from './DriverStatus';
import PickupStats from './PickupStats';
import CorridorControl from '@/components/controls/CorridorControl';
import LayerControl from '@/components/controls/LayerControl';
import ZoneAnalytics from './ZoneAnalytics';
import type { SpatialPipeline } from '@/hooks/useSpatialPipeline';

export default function Sidebar({
  pipeline,
  driverZone,
}: {
  pipeline: SpatialPipeline;
  driverZone: string | null;
}) {
  return (
    <aside className="elev-gradient z-20 flex w-full flex-none flex-col overflow-y-auto border-b border-border md:max-h-none md:w-[330px] md:border-b-0 md:border-r max-h-[44vh]">
      <RouteControl />
      <SimulationControl totalMeters={pipeline.totalMeters} />
      <DriverStatus totalMeters={pipeline.totalMeters} driverZone={driverZone} />
      <PickupStats stats={pipeline.stats} />
      <CorridorControl />
      <ZoneAnalytics zones={pipeline.zones} />
      <LayerControl />
    </aside>
  );
}
