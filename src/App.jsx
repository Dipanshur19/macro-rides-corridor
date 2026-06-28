import { useMemo, useState, useCallback } from 'react';

import MapView from './components/MapView.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import StatsPanel from './components/StatsPanel.jsx';

import { useRouteSimulation } from './hooks/useRouteSimulation.js';
import {
  routeLengthMeters,
  pointAtDistance,
  sliceRoute,
} from './lib/geo.js';
import {
  buildCorridor,
  classifyPickups,
  cellsToLeafletHexes,
  corridorAreaKm2,
} from './lib/h3Corridor.js';

import { getRouteById, DEFAULT_ROUTE_ID } from './data/routes.js';
import { ZONES } from './data/zones.js';
import { PICKUP_POINTS } from './data/pickupPoints.js';
import {
  DEFAULT_BUFFER_METERS,
  DEFAULT_H3_RESOLUTION,
  DEFAULT_LOOKAHEAD_METERS,
  DEFAULT_SPEED_KMH,
} from './config/constants.js';

// Snap corridor recomputation to a coarse grid so we don't rebuild the H3 index
// on every animation frame — only every ~25 m of driver movement.
const CORRIDOR_SNAP_M = 25;
// Small look-behind so the driver marker stays inside the dynamic corridor.
const LOOK_BEHIND_M = 200;

export default function App() {
  // --- configuration state ---
  const [routeId, setRouteId] = useState(DEFAULT_ROUTE_ID);
  const [customRoute, setCustomRoute] = useState(null);
  const [resolution, setResolution] = useState(DEFAULT_H3_RESOLUTION);
  const [bufferMeters, setBufferMeters] = useState(DEFAULT_BUFFER_METERS);
  const [corridorMode, setCorridorMode] = useState('ahead'); // 'ahead' | 'full'
  const [lookAheadMeters, setLookAheadMeters] = useState(DEFAULT_LOOKAHEAD_METERS);
  const [layers, setLayers] = useState({
    corridor: true,
    h3: false,
    zones: true,
    ineligible: true,
  });

  // --- draw-your-own-route state ---
  const [drawing, setDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);

  // --- active route ---
  const activeRouteCoords = useMemo(
    () => customRoute ?? getRouteById(routeId).coordinates,
    [customRoute, routeId]
  );
  const totalMeters = useMemo(
    () => routeLengthMeters(activeRouteCoords),
    [activeRouteCoords]
  );

  // --- simulation ---
  const baseSim = useRouteSimulation(totalMeters, DEFAULT_SPEED_KMH);
  const { progressMeters } = baseSim;

  // Driver position uses raw progress for smooth movement.
  const driverPosition = useMemo(
    () => (drawing ? null : pointAtDistance(activeRouteCoords, progressMeters)),
    [activeRouteCoords, progressMeters, drawing]
  );

  const traveledCoords = useMemo(() => {
    if (drawing || progressMeters < 1) return null;
    return sliceRoute(activeRouteCoords, 0, progressMeters);
  }, [activeRouteCoords, progressMeters, drawing]);

  // The route segment the corridor is built around (snapped for performance).
  const snapped = Math.round(progressMeters / CORRIDOR_SNAP_M) * CORRIDOR_SNAP_M;
  const corridorRouteCoords = useMemo(() => {
    if (corridorMode === 'full') return activeRouteCoords;
    const start = Math.max(0, snapped - LOOK_BEHIND_M);
    const end = snapped + lookAheadMeters;
    return sliceRoute(activeRouteCoords, start, end);
  }, [activeRouteCoords, corridorMode, snapped, lookAheadMeters]);

  // --- core H3 spatial computation ---
  const { bufferFeature, cells } = useMemo(
    () => buildCorridor(corridorRouteCoords, { bufferMeters, resolution }),
    [corridorRouteCoords, bufferMeters, resolution]
  );

  const pickups = useMemo(
    () =>
      classifyPickups(PICKUP_POINTS, {
        cells,
        resolution,
        routeCoords: corridorRouteCoords,
        zones: ZONES,
      }),
    [cells, resolution, corridorRouteCoords]
  );

  const hexes = useMemo(
    () => (layers.h3 ? cellsToLeafletHexes(cells) : []),
    [cells, layers.h3]
  );

  const stats = useMemo(() => {
    const eligible = pickups.filter((p) => p.eligible).length;
    return {
      eligible,
      total: pickups.length,
      cellCount: cells.size,
      areaKm2: corridorAreaKm2(cells, resolution),
    };
  }, [pickups, cells, resolution]);

  // --- handlers ---
  const handleRouteChange = useCallback((id) => {
    if (id === 'custom') return;
    setCustomRoute(null);
    setRouteId(id);
  }, []);

  const onLayerChange = useCallback(
    (key, val) => setLayers((s) => ({ ...s, [key]: val })),
    []
  );

  const draw = {
    drawing,
    isCustom: !!customRoute,
    count: draftPoints.length,
    canFinish: draftPoints.length >= 2,
    start: () => {
      setDrawing(true);
      setDraftPoints([]);
    },
    finish: () => {
      if (draftPoints.length >= 2) {
        setCustomRoute(draftPoints);
        setRouteId('custom');
      }
      setDrawing(false);
    },
    cancel: () => {
      setDrawing(false);
      setDraftPoints([]);
    },
  };
  const onAddPoint = useCallback(
    (coord) => setDraftPoints((pts) => [...pts, coord]),
    []
  );

  const displayRoute = drawing ? draftPoints : activeRouteCoords;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <svg className="logo" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#0f9d58" />
            <path
              d="M32 10 53 22v20L32 54 11 42V22z"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="32" r="6" fill="#fff" />
          </svg>
          <div>
            <h1>Macro Rides</h1>
            <p>Route Corridor &amp; Pickup Eligibility · H3 + Leaflet</p>
          </div>
        </div>

        <StatsPanel stats={stats} />

        <ControlPanel
          routeId={routeId}
          onRouteChange={handleRouteChange}
          resolution={resolution}
          onResolutionChange={setResolution}
          bufferMeters={bufferMeters}
          onBufferChange={setBufferMeters}
          corridorMode={corridorMode}
          onCorridorModeChange={setCorridorMode}
          lookAheadMeters={lookAheadMeters}
          onLookAheadChange={setLookAheadMeters}
          sim={baseSim}
          totalMeters={totalMeters}
          layers={layers}
          onLayerChange={onLayerChange}
          draw={draw}
        />

        <div className="footer-note">
          A pickup is <b>eligible</b> when its H3 cell (
          <code>latLngToCell</code>) is a member of the corridor cell-set built
          via <code>polygonToCells</code> from the 350&nbsp;m route buffer.
        </div>
      </aside>

      <div className="map-wrap">
        <MapView
          routeCoords={displayRoute}
          traveledCoords={traveledCoords}
          bufferFeature={drawing ? null : bufferFeature}
          hexes={drawing ? [] : hexes}
          pickups={pickups}
          zones={ZONES}
          driverPosition={driverPosition}
          layerToggles={layers}
          drawing={drawing}
          draftPoints={draftPoints}
          onAddPoint={onAddPoint}
        />

        {drawing && (
          <div className="map-hint">
            🖱️ Click to add waypoints — {draftPoints.length} added
          </div>
        )}

        <div className="progress-pill">
          <span>
            Mode: <b>{corridorMode === 'ahead' ? 'Dynamic look-ahead' : 'Whole route'}</b>
          </span>
          <span>
            Driver: <b>{(progressMeters / 1000).toFixed(2)} km</b>
          </span>
          <span>
            Eligible now: <b style={{ color: '#16c060' }}>{stats.eligible}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
