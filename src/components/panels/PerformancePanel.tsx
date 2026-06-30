import type { ReactNode } from 'react';
import { Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import FloatingPanel from '@/components/ui/FloatingPanel';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { formatNumber } from '@/utils/helpers';
import type { PipelineStats } from '@/types';

export default function PerformancePanel({ stats }: { stats: PipelineStats }) {
  const close = useStore((s) => s.closePanel);

  const stages = [
    { label: 'Input points', value: stats.total, color: '#94a3b8' },
    { label: 'Broad-phase (H3 candidates)', value: stats.candidates, color: '#f59e0b' },
    { label: 'Narrow-phase (eligible)', value: stats.eligible, color: '#16a34a' },
  ];
  const max = Math.max(stats.total, 1);

  return (
    <FloatingPanel
      title="Performance"
      icon={<Activity size={13} />}
      onClose={() => close('performance')}
      width={300}
    >
      <div className="space-y-3 px-3.5 py-3">
        <div className="space-y-2">
          {stages.map((s) => (
            <div key={s.label}>
              <div className="mb-1 flex justify-between text-2xs">
                <span className="text-muted">{s.label}</span>
                <span className="font-mono font-semibold">
                  <AnimatedNumber value={s.value} />
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${(s.value / max) * 100}%`, background: s.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <Metric
            label="Process"
            accent
            value={
              <>
                <AnimatedNumber value={stats.processingMs} decimals={1} locale={false} />
                <span className="ml-0.5 text-2xs font-semibold opacity-70">ms</span>
              </>
            }
          />
          <Metric label="H3 cells" value={<AnimatedNumber value={stats.cellCount} />} />
          <Metric label="Area km²" value={<AnimatedNumber value={stats.areaKm2} decimals={2} />} />
        </div>

        <p className="text-2xs leading-relaxed text-faint">
          Two-phase filter: O(1) H3 membership prunes {formatNumber(stats.total - stats.candidates)} points
          before the exact point-in-polygon test runs on just {formatNumber(stats.candidates)}.
        </p>
      </div>
    </FloatingPanel>
  );
}

function Metric({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/60 px-2 py-1.5 text-center">
      <div className={`font-mono text-sm font-bold ${accent ? 'text-primary' : 'text-text'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  );
}
