import { useMemo, useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer, H3HexagonLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, PathLayer, ScatterplotLayer, ColumnLayer } from '@deck.gl/layers';
import { useStore } from '@/store/useStore';
import { DECK_INITIAL_VIEW, TILES } from '@/constants/config';
import { DECK_COLORS, MAP_COLORS } from '@/constants/palette';
import { hexToRgb, clamp } from '@/utils/helpers';
import { pointAtDistance } from '@/services/routeService';
import type { SpatialPipeline } from '@/hooks/useSpatialPipeline';

type RGBA = [number, number, number, number];

interface HexDatum {
  hex: string;
  eligible: number;
}

export default function DeckView({ pipeline }: { pipeline: SpatialPipeline }) {
  const theme = useStore((s) => s.theme);
  const showHexes = useStore((s) => s.layers.h3 || s.layers.corridor);
  const showPickups = useStore((s) => s.layers.pickups);
  const showIneligible = useStore((s) => s.layers.ineligible);
  const showRoute = useStore((s) => s.layers.route);
  const follow = useStore((s) => s.followDriver);
  const isPlaying = useStore((s) => s.isPlaying);
  const rawProgress = useStore((s) => s.progressMeters);
  const recenterNonce = useStore((s) => s.recenterNonce);

  const tile = theme === 'dark' ? TILES.dark : TILES.light;

  // Extrude the actual corridor H3 cells. Cells that contain eligible pickups
  // rise higher and turn green, so the 3D corridor "tube" lights up where
  // pickups are matched. Small (res 10) footprints stay column-like at any zoom.
  const hexData = useMemo<HexDatum[]>(() => {
    const eligByCell = new Map<string, number>();
    for (const p of pipeline.pickups) {
      if (p.eligible) eligByCell.set(p.cell, (eligByCell.get(p.cell) ?? 0) + 1);
    }
    return [...pipeline.cells].map((hex) => ({ hex, eligible: eligByCell.get(hex) ?? 0 }));
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
            : [...hexToRgb(MAP_COLORS.ineligible), 150];
          return { position: [p.lng, p.lat] as [number, number], color };
        }),
    [pipeline.pickups, showIneligible]
  );

  const driverPos = useMemo(
    () => (pipeline.coords.length >= 2 ? pointAtDistance(pipeline.coords, rawProgress) : null),
    [pipeline.coords, rawProgress]
  );

  // Controlled camera that smoothly follows the driver (keeps pitch/zoom/bearing).
  const start = pipeline.coords[0];
  const [viewState, setViewState] = useState<Record<string, number>>(() =>
    start
      ? { ...DECK_INITIAL_VIEW, longitude: start[0], latitude: start[1] }
      : DECK_INITIAL_VIEW
  );

  // Recenter on the route start whenever the active route changes.
  useEffect(() => {
    const c = pipeline.coords[0];
    if (c) setViewState((v) => ({ ...v, longitude: c[0], latitude: c[1] }));
  }, [pipeline.coords]);

  // Manual "recenter" resets the camera to the route-start default framing.
  useEffect(() => {
    if (recenterNonce === 0) return;
    const c = pipeline.coords[0];
    setViewState({
      ...DECK_INITIAL_VIEW,
      longitude: c ? c[0] : DECK_INITIAL_VIEW.longitude,
      latitude: c ? c[1] : DECK_INITIAL_VIEW.latitude,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterNonce]);

  // Smoothly follow the driver while playing.
  useEffect(() => {
    if (follow && isPlaying && driverPos) {
      setViewState((v) => ({ ...v, longitude: driverPos[0], latitude: driverPos[1] }));
    }
  }, [driverPos, follow, isPlaying]);

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
      ? new H3HexagonLayer<HexDatum>({
          id: 'corridor-hex',
          data: hexData,
          extruded: true,
          getHexagon: (d) => d.hex,
          getElevation: (d) => 120 + d.eligible * 220,
          elevationScale: 1,
          getFillColor: (d) =>
            d.eligible > 0 ? DECK_COLORS.eligibleFill : DECK_COLORS.corridorFill,
          getLineColor: [255, 255, 255, 55],
          lineWidthMinPixels: 1,
          wireframe: true,
          pickable: true,
          material: { ambient: 0.7, diffuse: 0.6, shininess: 32 },
          opacity: 0.88,
          updateTriggers: { getElevation: hexData.length, getFillColor: hexData.length },
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
          getRadius: 30,
          radiusMinPixels: 2.5,
          radiusMaxPixels: 7,
          stroked: false,
        })
      : null,

    driverPos
      ? new ColumnLayer<{ position: [number, number] }>({
          id: 'driver',
          data: [{ position: driverPos as [number, number] }],
          diskResolution: 12,
          radius: 45,
          radiusUnits: 'meters',
          extruded: true,
          getPosition: (d) => d.position,
          getElevation: 700,
          elevationScale: 1,
          getFillColor: DECK_COLORS.driver,
          opacity: 0.95,
        })
      : null,
  ].filter(Boolean);

  return (
    <DeckGL
      viewState={viewState as any}
      onViewStateChange={(e: any) => {
        // Clamp zoom & pitch so the extruded hexagons can never distort.
        const v = e.viewState;
        v.zoom = clamp(v.zoom, 10.5, 16);
        v.pitch = clamp(v.pitch, 0, 60);
        setViewState(v);
      }}
      controller={{ dragRotate: true }}
      layers={layers as any}
      style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
    />
  );
}
