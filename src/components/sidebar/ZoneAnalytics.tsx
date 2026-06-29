import { PieChart } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { ZoneStat } from '@/types';

export default function ZoneAnalytics({ zones }: { zones: ZoneStat[] }) {
  return (
    <Card title="Zone Analytics" icon={<PieChart size={13} />}>
      <div className="space-y-3">
        {zones.map((z) => {
          const pct = z.total > 0 ? (z.eligible / z.total) * 100 : 0;
          return (
            <div key={z.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: z.color }} />
                  <span className="font-medium">{z.name}</span>
                </span>
                <span className="font-mono text-2xs text-muted">
                  {z.eligible}/{z.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${pct}%`, background: z.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
