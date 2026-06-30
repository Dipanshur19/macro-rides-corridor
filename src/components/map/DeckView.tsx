import { useMemo, useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer, H3HexagonLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, PathLayer, ScatterplotLayer, ColumnLayer } from '@deck.gl/layers';
import { useStore } from '@/store/useStore';
import { DECK_INITIAL_VIEW, TILES } from '@/constants/config';
import { DECK_COLORS, MAP_COLORS } from '@/constants/palette';
import { hexToRgb } from '@/utils/helpers';
import { cellFor } from '@/services/h3Service';
import { pointAtDistance } from '@/services/routeService';
import type { SpatialPipeline } from '@/hooks/useSpatialPipeline';

type RGBA = [number, number, number, number];

// Coarse resolution for the city-scale 3D demand field (chunky, visible columns).
const DEMAND_RES = 7;

interface DemandDatum {
  hex: string;
  count: number;
  eligible: number;
}

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
function ramp(from: string, to: string, t: number, alpha: number): RGBA {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), alpha];
}

export default function DeckView({ pipeline }: { pipeline: SpatialPipeline }) {
  const theme = useStore((s) => s.theme);
  const showHexes = useStore((s) => s.layers.h3 || s.layers.corridor);
  const showPickups = useStore((s) => s.layers.pickups);
  const showIneligible = useStore((s) => s.layers.ineligible);
  const showRoute = useStore((s) => s.layers.route);
  const follow = useStore((s) => s.followDriver);
  const isPlaying = useStore((s) => s.isPlaying);
  // Raw progress drives a buttery-smooth driver beacon + follow camera.
  const rawProgress = useStore((s) => s.progressMeters);

  const tile = theme === 'dark' ? TILES.dark : TILES.light;

  // City-scale demand field: aggregate ALL pickups into coarse H3 cells, and
  // track how many are currently eligible so the corridor "lights up" green.
  const { demand, maxCount } = useMemo(() => {
    const m = new Map<string, DemandDatum>();
    for (const p of pipeline.pickups) {
      const hex = cellFor(p.lat, p.lng, DEMAND_RES);
      const cur = m.get(hex) ?? { hex, count: 0, eligible: 0 };
      cur.count++;
      if (p.eligible) cur.eligible++;
      m.set(hex, cur);
    }
    let max = 1;
    for (const d of m.values()) max = Math.max(max, d.count);
    return { demand: [...m.values()], maxCount: max };
  }, [pipeline.pickups]);

  const pickupData = useMemo(
    () =>
      pipeline.pickups
        .filter((p) => p.eligible || p.candidate || showIneligible)
        .map((p) => {
          const color: RGBA = p.eligible
            ? [...hexToRgb(MAP_COLORS.eligible), 255]
            : p.candidate
            ? [...hexToRgb(MAP_COLORS.candidate), 235]
            : [...hexToRgb(MAP_COLORS.ineligible), 150];
          return { position: [p.lng, p.lat] as [number, number], color };
        }),
    [pipeline.pickups, showIneligible]
  );

  const driverPos = useMemo(
    () => (pipeline.coords.length >= 2 ? pointAtDistance(pipeline.coords, rawProgress) : null),
    [pipeline.coords, rawProgress]
  );

  // Controlled camera: user drags update it; when following + playing it
  // smoothly re-centres on the driver each frame (preserving pitch/bearing/zoom).
  const [viewState, setViewState] = useState<Record<string, number>>(DECK_INITIAL_VIEW);
  useEffect(() => {
    if (follow && isPlaying && driverPos) {
      setViewState((v) => ({ ...v, longitude: driverPos[0], latitude: driverPos[1] }));
    }
  }, [driverPos, follow, isPlaying]);

  const driverHeight = maxCount * 220 + 2600;

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

    showHexes
      ? new H3HexagonLayer<DemandDatum>({
          id: 'demand-hex',
          data: demand,
          extruded: true,
          getHexagon: (d) => d.hex,
          getElevation: (d) => 120 + d.count * 220 + d.eligible * 320,
          elevationScale: 1,
          getFillColor: (d) =>
            d.eligible > 0
              ? ramp('#15803d', '#4ade80', Math.min(1, d.eligible / Math.max(1, d.count)), 225)
              : ramp('#1e3a8a', '#22d3ee', Math.min(1, d.count / maxCount), 170),
          getLineColor: [255, 255, 255, 35],
          lineWidthMinPixels: 1,
          wireframe: true,
          pickable: true,
          material: { ambient: 0.65, diffuse: 0.6, shininess: 40 },
          opacity: 0.9,
          updateTriggers: { getFillColor: [maxCount], getElevation: [] },
        })
      : null,

    showRoute && pipeline.coords.length >= 2
      ? new PathLayer<{ path: [number, number][] }>({
          id: 'route',
          data: [{ path: pipeline.coords as [number, number][] }],
          getPath: (d) => d.path,
          getColor: DECK_COLORS.route,
          getWidth: 6,
          widthMinPixels: 3,
          capRounded: true,
          jointRounded: true,
        })
      : null,

    showPickups
      ? new ScatterplotLayer<{ position: [number, number]; color: RGBA }>({
          id: 'pickups',
          data: pickupData,
          getPosition: (d) => d.position,
          getFillColor: (d) => d.color,
          getRadius: 45,
          radiusMinPixels: 2,
          radiusMaxPixels: 6,
          stroked: false,
        })
      : null,

    driverPos
      ? new ColumnLayer<{ position: [number, number] }>({
          id: 'driver',
          data: [{ position: driverPos as [number, number] }],
          diskResolution: 6,
          radius: 140,
          extruded: true,
          getPosition: (d) => d.position,
          getElevation: driverHeight,
          elevationScale: 1,
          getFillColor: DECK_COLORS.driver,
          opacity: 0.95,
          updateTriggers: { getElevation: [driverHeight] },
        })
      : null,
  ].filter(Boolean);

  return (
    <DeckGL
      viewState={viewState as any}
      onViewStateChange={(e: any) => setViewState(e.viewState)}
      controller={{ dragRotate: true }}
      layers={layers as any}
      style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
    />
  );
}
