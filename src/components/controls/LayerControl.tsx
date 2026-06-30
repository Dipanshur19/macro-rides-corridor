import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import { MAP_COLORS } from '@/constants/palette';
import type { LayerVisibility } from '@/types';

const ITEMS: { key: keyof LayerVisibility; label: string; swatch?: string }[] = [
  { key: 'route', label: 'Driver route', swatch: MAP_COLORS.route },
  { key: 'corridor', label: '350 m corridor', swatch: MAP_COLORS.corridor },
  { key: 'h3', label: 'H3 hexagon grid', swatch: MAP_COLORS.h3 },
  { key: 'zones', label: 'Service zones', swatch: MAP_COLORS.zone },
  { key: 'pickups', label: 'Pickup points', swatch: MAP_COLORS.eligible },
  { key: 'ineligible', label: 'Show ineligible', swatch: MAP_COLORS.ineligible },
  { key: 'heatmap', label: 'Demand heatmap', swatch: MAP_COLORS.candidate },
];

export default function LayerControl() {
  const layers = useStore((s) => s.layers);
  const toggleLayer = useStore((s) => s.toggleLayer);
  return (
    <Card title="Layers" icon={<span>🗂️</span>}>
      {ITEMS.map((it) => (
        <Toggle
          key={it.key}
          label={it.label}
          swatch={it.swatch}
          checked={layers[it.key]}
          onChange={() => toggleLayer(it.key)}
        />
      ))}
    </Card>
  );
}
