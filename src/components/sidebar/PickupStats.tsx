import Card from '@/components/ui/Card';
import Stat from '@/components/ui/Stat';
import type { PipelineStats } from '@/types';

export default function PickupStats({ stats }: { stats: PipelineStats }) {
  const pct = stats.total > 0 ? Math.round((stats.eligible / stats.total) * 100) : 0;
  return (
    <Card title="Pickup Eligibility" icon={<span>📍</span>}>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat value={stats.eligible} label={`Eligible (${pct}%)`} tone="success" />
        <Stat value={stats.candidates} label="H3 candidates" tone="warning" />
        <Stat value={stats.total} label="Total pickups" />
        <Stat value={stats.rejected} label="Rejected" />
      </div>
    </Card>
  );
}
