import { Search, Sun, Moon, Keyboard, Hexagon, Activity, ScrollText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useFps } from '@/hooks/useFps';
import { cn, formatMs } from '@/utils/helpers';
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
  const panels = useStore((s) => s.panels);

  return (
    <header className="relative z-30 flex h-14 items-center gap-2 border-b border-border bg-bg-elevated px-3 sm:gap-3 sm:px-4">
      {/* brand */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="brand-mark grid h-8 w-8 place-items-center rounded-lg text-white">
          <Hexagon size={18} fill="currentColor" />
        </div>
        <div className="leading-tight">
          <div className="gradient-text whitespace-nowrap text-sm font-bold tracking-tight">
            Macro Rides
          </div>
          <div className="hidden text-2xs text-muted sm:block">Dispatch Console</div>
        </div>
      </div>

      <div className="mx-1 hidden h-7 w-px bg-border sm:block" />

      {/* status pill */}
      <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 sm:flex">
        <span className={isPlaying ? 'animate-pulse text-xs leading-none' : 'text-xs leading-none'}>
          {isPlaying ? '🟢' : '⚪'}
        </span>
        <span className="text-xs font-medium">
          {isPlaying ? 'Live simulation' : 'Standby'}
        </span>
      </div>

      {/* search */}
      <div className="relative ml-auto min-w-0 flex-1 sm:w-56 sm:flex-none">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
        <input
          id="global-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
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
      <div className="w-[104px] shrink-0 sm:w-[124px]">
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

      <div className="hidden items-center gap-2 md:flex">
        <button
          onClick={() => togglePanel('performance')}
          title="Performance panel (P)"
          className={cn(
            'rounded-lg border border-border bg-surface-2 p-2 transition-colors',
            panels.performance ? 'text-primary' : 'text-muted hover:text-text'
          )}
        >
          <Activity size={16} />
        </button>
        <button
          onClick={() => togglePanel('eventLog')}
          title="Event log (E)"
          className={cn(
            'rounded-lg border border-border bg-surface-2 p-2 transition-colors',
            panels.eventLog ? 'text-primary' : 'text-muted hover:text-text'
          )}
        >
          <ScrollText size={16} />
        </button>
        <button
          onClick={() => togglePanel('shortcuts')}
          title="Keyboard shortcuts (?)"
          className="rounded-lg border border-border bg-surface-2 p-2 text-muted transition-colors hover:text-text"
        >
          <Keyboard size={16} />
        </button>
      </div>
      <button
        onClick={toggleTheme}
        title="Toggle theme (T)"
        className="shrink-0 rounded-lg border border-border bg-surface-2 p-2 text-muted transition-colors hover:text-text"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="accent-bar pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70" />
    </header>
  );
}
