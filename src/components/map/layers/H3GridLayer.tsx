import { Polygon } from 'react-leaflet';
import { useStore } from '@/store/useStore';
import { MAP_COLORS } from '@/constants/palette';
import type { LeafletHex } from '@/services/h3Service';

/** The H3 cells that make up the corridor index (visualises the broad-phase). */
export default function H3GridLayer({ hexes }: { hexes: LeafletHex[] }) {
  const visible = useStore((s) => s.layers.h3);
  const selectCell = useStore((s) => s.selectCell);
  const selectedCell = useStore((s) => s.selectedCell);
  if (!visible || hexes.length === 0) return null;

  return (
    <>
      {hexes.map((h) => {
        const isSelected = h.id === selectedCell;
        return (
          <Polygon
            key={h.id}
            positions={h.latlngs}
            pathOptions={{
              color: MAP_COLORS.h3,
              weight: isSelected ? 2 : 0.6,
              opacity: isSelected ? 1 : 0.5,
              fillColor: MAP_COLORS.h3,
              fillOpacity: isSelected ? 0.28 : 0.06,
            }}
            eventHandlers={{ click: () => selectCell(h.id) }}
          />
        );
      })}
    </>
  );
}
