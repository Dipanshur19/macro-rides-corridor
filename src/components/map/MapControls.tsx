import { LocateFixed, Crosshair } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/helpers';

/** Floating map controls (recenter + follow), offset to clear Leaflet zoom. */
export default function MapControls() {
  const requestRecenter = useStore((s) => s.requestRecenter);
  const follow = useStore((s) => s.followDriver);
  const toggleFollow = useStore((s) => s.toggleFollow);

  return (
    <div className="pointer-events-auto absolute left-3 top-[88px] flex flex-col gap-2">
      <button
        onClick={requestRecenter}
        title="Recenter on route"
        className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/90 text-muted shadow-panel backdrop-blur-md transition-colors hover:text-text"
      >
        <LocateFixed size={17} />
      </button>
      <button
        onClick={toggleFollow}
        title="Follow driver (F)"
        className={cn(
          'grid h-9 w-9 place-items-center rounded-lg border bg-surface/90 shadow-panel backdrop-blur-md transition-colors',
          follow ? 'border-primary text-primary' : 'border-border text-muted hover:text-text'
        )}
      >
        <Crosshair size={17} />
      </button>
    </div>
  );
}
