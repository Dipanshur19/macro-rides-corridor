import { MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import Stat from '@/components/ui/Stat';
import { formatNumber } from '@/utils/helpers';
import type { PipelineStats } from '@/types';

export default function PickupStats({ stats }: { stats: PipelineStats }) {
  const pct = stats.total > 0 ? Math.round((stats.eligible / stats.total) * 100) : 0;
  return (
    <Card title="Pickup Eligibility" icon={<MapPin size={13} />}>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat value={formatNumber(stats.eligible)} label={`Eligible (${pct}%)`} tone="success" />
        <Stat value={formatNumber(stats.candidates)} label="H3 candidates" tone="warning" />
        <Stat value={formatNumber(stats.total)} label="Total pickups" />
        <Stat value={formatNumber(stats.rejected)} label="Rejected" />
      </div>
    </Card>
  );
}
