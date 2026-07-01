import { AnimatePresence } from 'framer-motion';
import { Move3d, Pencil } from 'lucide-react';
import { useStore } from '@/store/useStore';
import MapView from './MapView';
import DeckView from './DeckView';
import MapControls from './MapControls';
import Legend from '@/components/legend/Legend';
import PerformancePanel from '@/components/panels/PerformancePanel';
import EventLog from '@/components/panels/EventLog';
import H3Inspector from '@/components/panels/H3Inspector';
import ShortcutsModal from '@/components/panels/ShortcutsModal';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import type { SpatialPipeline } from '@/hooks/useSpatialPipeline';

export default function MapArea({ pipeline }: { pipeline: SpatialPipeline }) {
  const viewMode = useStore((s) => s.viewMode);
  const panels = useStore((s) => s.panels);
  const drawing = useStore((s) => s.drawing);
  const draftCount = useStore((s) => s.draftPoints.length);
  const corridorMode = useStore((s) => s.corridorMode);

  return (
    <div className="relative min-h-0 flex-1">
      {viewMode === '2d' ? <MapView pipeline={pipeline} /> : <DeckView pipeline={pipeline} />}

      {/* overlays */}
      <div className="pointer-events-none absolute inset-0 z-[500]">
        <MapControls />
        {/* top-center hints */}
        <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center gap-2">
          {drawing && (
            <div className="glass pointer-events-none flex items-center gap-2 rounded-full border border-primary px-4 py-1.5 text-xs">
              <Pencil size={13} /> Click to add waypoints — {draftCount} added
            </div>
          )}
          {viewMode === '3d' && (
            <div className="glass card-hi pointer-events-none hidden items-center gap-2 rounded-full px-4 py-1.5 text-2xs text-muted sm:flex">
              <Move3d size={13} /> Drag to rotate · Ctrl/Right-drag to tilt · Scroll to zoom
            </div>
          )}
        </div>

        {/* right column panels (desktop only) */}
        <div className="absolute right-3 top-3 hidden flex-col gap-3 md:flex">
          <AnimatePresence>
            {panels.performance && <PerformancePanel key="perf" stats={pipeline.stats} />}
            {panels.h3Inspector && <H3Inspector key="h3" cells={pipeline.cells} />}
          </AnimatePresence>
        </div>

        {/* bottom-right event log (desktop only) */}
        <div className="absolute bottom-3 right-3 hidden md:block">
          <AnimatePresence>{panels.eventLog && <EventLog key="log" />}</AnimatePresence>
        </div>

        {/* bottom-left legend */}
        <div className="absolute bottom-3 left-3 hidden lg:block">
          <Legend />
        </div>

        {/* bottom-center status pill (desktop only) */}
        <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 sm:block">
          <div className="glass card-hi flex items-center gap-4 rounded-xl px-4 py-2 text-2xs text-muted">
            <span>
              Mode:{' '}
              <b className="text-text">
                {corridorMode === 'ahead' ? 'Dynamic look-ahead' : 'Whole route'}
              </b>
            </span>
            <span className="h-3 w-px bg-border" />
            <span>
              Eligible: <b className="text-success"><AnimatedNumber value={pipeline.stats.eligible} /></b>
            </span>
            <span className="h-3 w-px bg-border" />
            <span>
              H3 cells: <b className="text-text"><AnimatedNumber value={pipeline.stats.cellCount} /></b>
            </span>
          </div>
        </div>
      </div>

      {/* shortcuts modal */}
      <AnimatePresence>{panels.shortcuts && <ShortcutsModal key="sc" />}</AnimatePresence>
    </div>
  );
}
