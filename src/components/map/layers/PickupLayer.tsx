import { CircleMarker, Popup } from 'react-leaflet';
import { useStore } from '@/store/useStore';
import { MAP_COLORS } from '@/constants/palette';
import type { ClassifiedPickup } from '@/types';

function colorFor(p: ClassifiedPickup): string {
  if (p.eligible) return MAP_COLORS.eligible;
  if (p.candidate) return MAP_COLORS.candidate;
  return MAP_COLORS.ineligible;
}

export default function PickupLayer({ pickups }: { pickups: ClassifiedPickup[] }) {
  const show = useStore((s) => s.layers.pickups);
  const showIneligible = useStore((s) => s.layers.ineligible);
  const query = useStore((s) => s.searchQuery.trim().toLowerCase());
  const selectPickup = useStore((s) => s.selectPickup);
  const selectCell = useStore((s) => s.selectCell);

  if (!show) return null;

  return (
    <>
      {pickups.map((p) => {
        if (!p.eligible && !p.candidate && !showIneligible) return null;
        const match =
          query.length > 0 &&
          (p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query));
        const color = colorFor(p);
        const radius = p.eligible ? 6 : p.candidate ? 5 : 3.5;

        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={match ? radius + 4 : radius}
            pathOptions={{
              color: match ? MAP_COLORS.accent : 'rgba(15,23,42,0.6)',
              weight: match ? 3 : 1,
              fillColor: color,
              fillOpacity: p.eligible ? 0.95 : p.candidate ? 0.85 : 0.55,
            }}
            eventHandlers={{
              click: () => {
                selectPickup(p.id);
                selectCell(p.cell);
              },
            }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-muted">{p.id} · {p.category}</div>
                <Row label="Status" value={p.eligible ? 'Eligible' : p.candidate ? 'Candidate (failed exact test)' : 'Outside corridor'} accent={p.eligible ? MAP_COLORS.eligible : p.candidate ? MAP_COLORS.candidate : MAP_COLORS.ineligible} />
                <Row label="Distance to route" value={`${p.distanceMeters} m`} />
                <Row label="Zone" value={p.zone ?? '—'} />
                <div className="pt-1 font-mono text-[10px] text-muted">H3 · {p.cell}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="font-semibold" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}
