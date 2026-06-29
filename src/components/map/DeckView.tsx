import { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer, H3HexagonLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { useStore } from '@/store/useStore';
import { DECK_INITIAL_VIEW, TILES } from '@/constants/config';
import { DECK_COLORS, MAP_COLORS } from '@/constants/palette';
import { hexToRgb } from '@/utils/helpers';
import { pointAtDistance } from '@/services/routeService';
import type { SpatialPipeline } from '@/hooks/useSpatialPipeline';

type RGBA = [number, number, number, number];

interface HexDatum {
  hex: string;
  eligible: number;
}

export default function DeckView({ pipeline }: { pipeline: SpatialPipeline }) {
  const theme = useStore((s) => s.theme);
  const showH3 = useStore((s) => s.layers.h3);
  const showCorridor = useStore((s) => s.layers.corridor);
  const showPickups = useStore((s) => s.layers.pickups);
  const showIneligible = useStore((s) => s.layers.ineligible);
  const showRoute = useStore((s) => s.layers.route);
  // snapped -> driver column updates every 25 m (cheap in 3D)
  const snapped = useStore((s) => Math.round(s.progressMeters / 25) * 25);

  const tile = theme === 'dark' ? TILES.dark : TILES.light;

  // Aggregate eligible pickups per corridor cell -> extrusion height.
  const hexData = useMemo<HexDatum[]>(() => {
    const counts = new Map<string, number>();
    for (const p of pipeline.pickups) {
      if (p.eligible) counts.set(p.cell, (counts.get(p.cell) ?? 0) + 1);
    }
    return [...pipeline.cells].map((hex) => ({ hex, eligible: counts.get(hex) ?? 0 }));
  }, [pipeline.cells, pipeline.pickups]);

  const pickupData = useMemo(
    () =>
      pipeline.pickups
        .filter((p) => p.eligible || p.candidate || showIneligible)
        .map((p) => {
          const color: RGBA = p.eligible
            ? [...hexToRgb(MAP_COLORS.eligible), 255]
            : p.candidate
            ? [...hexToRgb(MAP_COLORS.candidate), 235]
            : [...hexToRgb(MAP_COLORS.ineligible), 170];
          return { position: [p.lng, p.lat] as [number, number], color, r: p.eligible ? 55 : 38 };
        }),
    [pipeline.pickups, showIneligible]
  );

  const driverPos = useMemo(
    () => (pipeline.coords.length >= 2 ? pointAtDistance(pipeline.coords, snapped) : null),
    [pipeline.coords, snapped]
  );

  const layers = [
    new TileLayer({
      id: 'basemap',
      data: tile.deckUrl,
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: (props: any) => {
        const { boundingBox } = props.tile;
        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [
            boundingBox[0][0],
            boundingBox[0][1],
            boundingBox[1][0],
            boundingBox[1][1],
          ],
        });
      },
    }),
    showH3 || showCorridor
      ? new H3HexagonLayer<HexDatum>({
          id: 'corridor-hex',
          data: hexData,
          extruded: true,
          getHexagon: (d) => d.hex,
          getElevation: (d) => 60 + d.eligible * 140,
          elevationScale: 1,
          getFillColor: (d) =>
            d.eligible > 0 ? DECK_COLORS.eligibleFill : DECK_COLORS.corridorFill,
          getLineColor: [255, 255, 255, 40],
          lineWidthMinPixels: 1,
          wireframe: true,
          pickable: true,
          material: { ambient: 0.6, diffuse: 0.6, shininess: 32 },
          opacity: 0.85,
        })
      : null,
    showRoute && pipeline.coords.length >= 2
      ? new PathLayer<{ path: [number, number][] }>({
          id: 'route',
          data: [{ path: pipeline.coords as [number, number][] }],
          getPath: (d) => d.path,
          getColor: DECK_COLORS.route,
          getWidth: 5,
          widthMinPixels: 3,
          capRounded: true,
          jointRounded: true,
        })
      : null,
    showPickups
      ? new ScatterplotLayer<{ position: [number, number]; color: RGBA; r: number }>({
          id: 'pickups',
          data: pickupData,
          getPosition: (d) => d.position,
          getFillColor: (d) => d.color,
          getRadius: (d) => d.r,
          radiusMinPixels: 2,
          radiusMaxPixels: 7,
          stroked: false,
        })
      : null,
    driverPos
      ? new ScatterplotLayer<{ position: [number, number] }>({
          id: 'driver',
          data: [{ position: driverPos as [number, number] }],
          getPosition: (d) => d.position,
          getFillColor: DECK_COLORS.driver,
          getLineColor: [255, 255, 255, 255],
          lineWidthMinPixels: 2,
          stroked: true,
          getRadius: 90,
          radiusMinPixels: 6,
          radiusMaxPixels: 14,
        })
      : null,
  ].filter(Boolean);

  return (
    <DeckGL
      initialViewState={DECK_INITIAL_VIEW}
      controller={{ dragRotate: true }}
      layers={layers as any}
      style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
    />
  );
}
