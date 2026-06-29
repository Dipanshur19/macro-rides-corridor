import { Route as RouteIcon, Pencil, Check, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ROUTES } from '@/data/routes';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/helpers';

const catColor: Record<string, string> = {
  Business: 'text-primary border-primary/40 bg-primary/10',
  Residential: 'text-success border-success/40 bg-success/10',
  Airport: 'text-warning border-warning/40 bg-warning/10',
  Custom: 'text-accent border-accent/40 bg-accent/10',
};

export default function RouteControl() {
  const routeId = useStore((s) => s.routeId);
  const customRoute = useStore((s) => s.customRoute);
  const setRoute = useStore((s) => s.setRoute);
  const drawing = useStore((s) => s.drawing);
  const draftCount = useStore((s) => s.draftPoints.length);
  const startDraw = useStore((s) => s.startDraw);
  const finishDraw = useStore((s) => s.finishDraw);
  const cancelDraw = useStore((s) => s.cancelDraw);

  const active = ROUTES.find((r) => r.id === routeId);
  const category = customRoute ? 'Custom' : active?.category ?? 'Business';

  return (
    <Card title="Driver Route" icon={<RouteIcon size={13} />}>
      <select
        value={customRoute ? 'custom' : routeId}
        onChange={(e) => setRoute(e.target.value)}
        disabled={drawing}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-primary disabled:opacity-50"
      >
        {ROUTES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
        {customRoute && <option value="custom">Custom route</option>}
      </select>

      <div className="mt-2.5 flex items-center justify-between">
        <span
          className={cn(
            'rounded-md border px-2 py-0.5 text-2xs font-semibold',
            catColor[category]
          )}
        >
          {category}
        </span>
        {!drawing ? (
          <button
            onClick={startDraw}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-text"
          >
            <Pencil size={13} /> Draw route
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={finishDraw}
              disabled={draftCount < 2}
              className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              <Check size={13} /> Finish ({draftCount})
            </button>
            <button
              onClick={cancelDraw}
              className="rounded-lg border border-border bg-surface-2 p-1.5 text-muted hover:text-danger"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      {drawing && (
        <p className="mt-2 text-2xs text-muted">
          Click waypoints on the map (minimum 2), then Finish.
        </p>
      )}
    </Card>
  );
}
