import { MAP_COLORS } from '@/constants/palette';

const ITEMS: { c: string; label: string; ring?: boolean }[] = [
  { c: MAP_COLORS.route, label: 'Driver route' },
  { c: MAP_COLORS.corridor, label: '350 m corridor' },
  { c: MAP_COLORS.eligible, label: 'Eligible pickup' },
  { c: MAP_COLORS.candidate, label: 'H3 candidate' },
  { c: MAP_COLORS.ineligible, label: 'Ineligible' },
  { c: MAP_COLORS.zone, label: 'Service zone' },
  { c: MAP_COLORS.driver, label: 'Driver' },
];

export default function Legend() {
  return (
    <div className="pointer-events-auto rounded-xl border border-border bg-surface/90 p-3 shadow-panel backdrop-blur-md">
      <div className="mb-2 text-2xs font-semibold uppercase tracking-wider text-muted">
        Legend
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ITEMS.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-2xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.c }} />
            <span className="text-muted">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
