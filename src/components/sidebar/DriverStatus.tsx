import { Navigation } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import { cn, formatKm } from '@/utils/helpers';

export default function DriverStatus({
  totalMeters,
  driverZone,
}: {
  totalMeters: number;
  driverZone: string | null;
}) {
  const progress = useStore((s) => s.progressMeters);
  const isPlaying = useStore((s) => s.isPlaying);
  const speedKmh = useStore((s) => s.speedKmh);
  const multiplier = useStore((s) => s.speedMultiplier);
  const pct = totalMeters > 0 ? Math.min(100, (progress / totalMeters) * 100) : 0;

  return (
    <Card title="Driver Status" icon={<Navigation size={13} />}>
      <div className="grid grid-cols-2 gap-2.5">
        <Field
          label="Status"
          value={isPlaying ? 'En route' : 'Idle'}
          dot={isPlaying ? 'bg-success' : 'bg-faint'}
        />
        <Field label="Ground speed" value={`${speedKmh * multiplier} km/h`} />
        <Field label="Distance" value={formatKm(progress)} />
        <Field label="Current zone" value={driverZone ?? '—'} />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-2xs text-muted">
          <span>Route progress</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

function Field({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/60 px-2.5 py-2">
      <div className="text-2xs text-muted">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold">
        {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
        {value}
      </div>
    </div>
  );
}
