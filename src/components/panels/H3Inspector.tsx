import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { inspectCell } from '@/services/h3Service';

export default function H3Inspector({ cells }: { cells: Set<string> }) {
  const selectedCell = useStore((s) => s.selectedCell);
  const close = useStore((s) => s.closePanel);
  const selectCell = useStore((s) => s.selectCell);

  const info = useMemo(
    () => (selectedCell ? inspectCell(selectedCell) : null),
    [selectedCell]
  );

  return (
    <FloatingPanel
      title="H3 Inspector"
      icon={<span>🔷</span>}
      onClose={() => {
        selectCell(null);
        close('h3Inspector');
      }}
      width={300}
    >
      <div className="px-3.5 py-3">
        {!info ? (
          <p className="py-3 text-center text-2xs text-faint">
            Click a hexagon or pickup on the map to inspect its H3 cell.
          </p>
        ) : (
          <div className="space-y-2.5 text-xs">
            <Row label="Cell index" value={info.index} mono />
            <Row label="Resolution" value={String(info.resolution)} />
            <Row label="Cell area" value={`${(info.areaKm2 * 1_000_000).toFixed(0)} m²`} />
            <Row
              label="Center"
              value={`${info.center[0].toFixed(5)}, ${info.center[1].toFixed(5)}`}
              mono
            />
            <Row
              label="In corridor"
              value={cells.has(info.index) ? 'Yes' : 'No'}
              accent={cells.has(info.index) ? '#16a34a' : '#94a3b8'}
            />
            <div>
              <div className="mb-1 text-muted">Ring-1 neighbors ({info.neighbors.length})</div>
              <div className="flex flex-wrap gap-1">
                {info.neighbors.map((n) => (
                  <button
                    key={n}
                    onClick={() => selectCell(n)}
                    className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-muted hover:text-text"
                    title={n}
                  >
                    {n.slice(-5)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}

function Row({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span
        className={`truncate text-right font-semibold ${mono ? 'font-mono text-[10px]' : ''}`}
        style={accent ? { color: accent } : undefined}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
