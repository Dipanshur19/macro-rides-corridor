import { Search, Sun, Moon, Keyboard, Hexagon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useFps } from '@/hooks/useFps';
import { formatMs } from '@/utils/helpers';
import Segmented from '@/components/ui/Segmented';
import type { ViewMode } from '@/types';

export default function Header({ processingMs }: { processingMs: number }) {
  const fps = useFps();
  const isPlaying = useStore((s) => s.isPlaying);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);
  const search = useStore((s) => s.searchQuery);
  const setSearch = useStore((s) => s.setSearch);
  const togglePanel = useStore((s) => s.togglePanel);

  return (
    <header className="z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
      {/* brand */}
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
          <Hexagon size={18} fill="currentColor" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">Macro Rides</div>
          <div className="text-2xs text-muted">Dispatch Console</div>
        </div>
      </div>

      <div className="mx-1 hidden h-7 w-px bg-border sm:block" />

      {/* status pill */}
      <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 sm:flex">
        <span
          className={`h-2 w-2 rounded-full ${
            isPlaying ? 'animate-pulse bg-success' : 'bg-faint'
          }`}
        />
        <span className="text-xs font-medium">
          {isPlaying ? 'Live simulation' : 'Standby'}
        </span>
      </div>

      {/* search */}
      <div className="relative ml-auto w-40 sm:w-56">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
        <input
          id="global-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pickups…"
          className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-faint focus:border-primary"
        />
      </div>

      {/* perf chips */}
      <div className="hidden items-center gap-2 font-mono text-2xs text-muted lg:flex">
        <span className="rounded-md border border-border bg-surface-2 px-2 py-1">
          {fps} FPS
        </span>
        <span className="rounded-md border border-border bg-surface-2 px-2 py-1">
          {formatMs(processingMs)}
        </span>
      </div>

      {/* view mode */}
      <div className="w-[124px]">
        <Segmented<ViewMode>
          size="sm"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: '2d', label: '2D' },
            { value: '3d', label: '3D' },
          ]}
        />
      </div>

      <button
        onClick={() => togglePanel('shortcuts')}
        title="Keyboard shortcuts (?)"
        className="rounded-lg border border-border bg-surface-2 p-2 text-muted transition-colors hover:text-text"
      >
        <Keyboard size={16} />
      </button>
      <button
        onClick={toggleTheme}
        title="Toggle theme (T)"
        className="rounded-lg border border-border bg-surface-2 p-2 text-muted transition-colors hover:text-text"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
