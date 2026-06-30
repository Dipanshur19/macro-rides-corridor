import { create } from 'zustand';
import type {
  CorridorMode,
  EventLogEntry,
  EventType,
  LayerVisibility,
  LngLat,
  Theme,
  ViewMode,
} from '@/types';
import {
  DEFAULT_BUFFER_METERS,
  DEFAULT_H3_RESOLUTION,
  DEFAULT_LOOKAHEAD_METERS,
  DEFAULT_SPEED_KMH,
  EVENT_LOG_LIMIT,
} from '@/constants/config';
import { DEFAULT_ROUTE_ID } from '@/data/routes';

export type PanelKey = 'performance' | 'eventLog' | 'h3Inspector' | 'shortcuts';

export interface StoreState {
  // route
  routeId: string;
  customRoute: LngLat[] | null;
  // corridor params
  resolution: number;
  bufferMeters: number;
  corridorMode: CorridorMode;
  lookAheadMeters: number;
  // simulation
  isPlaying: boolean;
  progressMeters: number;
  speedKmh: number;
  speedMultiplier: number;
  // view / theme
  viewMode: ViewMode;
  theme: Theme;
  followDriver: boolean;
  // layers + panels
  layers: LayerVisibility;
  panels: Record<PanelKey, boolean>;
  // selection / search
  selectedPickupId: string | null;
  selectedCell: string | null;
  searchQuery: string;
  // draw
  drawing: boolean;
  draftPoints: LngLat[];
  // events
  events: EventLogEntry[];
  // recenter signal (incremented to ask the map to recenter)
  recenterNonce: number;

  // actions
  setRoute: (id: string) => void;
  setResolution: (r: number) => void;
  setBuffer: (m: number) => void;
  setCorridorMode: (m: CorridorMode) => void;
  setLookAhead: (m: number) => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  reset: () => void;
  setProgress: (m: number) => void;
  seek: (m: number) => void;
  setSpeed: (kmh: number) => void;
  setMultiplier: (m: number) => void;

  setViewMode: (v: ViewMode) => void;
  toggleViewMode: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleFollow: () => void;

  toggleLayer: (k: keyof LayerVisibility) => void;
  togglePanel: (k: PanelKey) => void;
  closePanel: (k: PanelKey) => void;

  selectPickup: (id: string | null) => void;
  selectCell: (cell: string | null) => void;
  setSearch: (q: string) => void;

  startDraw: () => void;
  addDraftPoint: (c: LngLat) => void;
  finishDraw: () => void;
  cancelDraw: () => void;

  pushEvent: (type: EventType, message: string) => void;
  clearEvents: () => void;
  requestRecenter: () => void;
}

let eventId = 0;

const initialLayers: LayerVisibility = {
  route: true,
  corridor: true,
  h3: false,
  zones: true,
  pickups: true,
  ineligible: true,
  heatmap: false,
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('mr-theme');
  return saved === 'light' || saved === 'dark' ? saved : 'dark';
}

export const useStore = create<StoreState>((set, get) => ({
  routeId: DEFAULT_ROUTE_ID,
  customRoute: null,
  resolution: DEFAULT_H3_RESOLUTION,
  bufferMeters: DEFAULT_BUFFER_METERS,
  corridorMode: 'ahead',
  lookAheadMeters: DEFAULT_LOOKAHEAD_METERS,

  isPlaying: false,
  progressMeters: 0,
  speedKmh: DEFAULT_SPEED_KMH,
  speedMultiplier: 1,

  viewMode: '2d',
  theme: getInitialTheme(),
  followDriver: true,

  layers: initialLayers,
  panels: { performance: true, eventLog: true, h3Inspector: false, shortcuts: false },

  selectedPickupId: null,
  selectedCell: null,
  searchQuery: '',

  drawing: false,
  draftPoints: [],

  events: [],
  recenterNonce: 0,

  setRoute: (id) => {
    if (id === get().routeId && !get().customRoute) return;
    set({ routeId: id, customRoute: null, progressMeters: 0, isPlaying: false });
    get().pushEvent('system', `Route switched to "${id}"`);
  },
  setResolution: (r) => {
    set({ resolution: r });
    get().pushEvent('info', `H3 resolution set to ${r}`);
  },
  setBuffer: (m) => set({ bufferMeters: m }),
  setCorridorMode: (m) => {
    set({ corridorMode: m });
    get().pushEvent('info', `Corridor mode: ${m === 'ahead' ? 'dynamic look-ahead' : 'whole route'}`);
  },
  setLookAhead: (m) => set({ lookAheadMeters: m }),

  play: () => {
    set((s) => ({ isPlaying: true, progressMeters: s.progressMeters }));
    get().pushEvent('success', 'Simulation started');
  },
  pause: () => {
    set({ isPlaying: false });
    get().pushEvent('info', 'Simulation paused');
  },
  togglePlay: () => (get().isPlaying ? get().pause() : get().play()),
  reset: () => {
    set({ isPlaying: false, progressMeters: 0 });
    get().pushEvent('system', 'Driver reset to start');
  },
  setProgress: (m) => set({ progressMeters: m }),
  seek: (m) => set({ progressMeters: m, isPlaying: false }),
  setSpeed: (kmh) => set({ speedKmh: kmh }),
  setMultiplier: (m) => {
    set({ speedMultiplier: m });
    get().pushEvent('info', `Playback speed ${m}x`);
  },

  setViewMode: (v) => set({ viewMode: v }),
  toggleViewMode: () => {
    const next = get().viewMode === '2d' ? '3d' : '2d';
    set({ viewMode: next });
    get().pushEvent('system', `Switched to ${next.toUpperCase()} map`);
  },
  setTheme: (t) => set({ theme: t }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  toggleFollow: () => {
    const next = !get().followDriver;
    set({ followDriver: next });
    get().pushEvent('info', `Camera follow ${next ? 'enabled' : 'disabled'}`);
  },

  toggleLayer: (k) => set((s) => ({ layers: { ...s.layers, [k]: !s.layers[k] } })),
  togglePanel: (k) => set((s) => ({ panels: { ...s.panels, [k]: !s.panels[k] } })),
  closePanel: (k) => set((s) => ({ panels: { ...s.panels, [k]: false } })),

  selectPickup: (id) => set({ selectedPickupId: id }),
  selectCell: (cell) => set({ selectedCell: cell, panels: { ...get().panels, h3Inspector: cell ? true : get().panels.h3Inspector } }),
  setSearch: (q) => set({ searchQuery: q }),

  startDraw: () => {
    set({ drawing: true, draftPoints: [] });
    get().pushEvent('system', 'Draw mode: click waypoints on the map');
  },
  addDraftPoint: (c) => set((s) => ({ draftPoints: [...s.draftPoints, c] })),
  finishDraw: () => {
    const pts = get().draftPoints;
    if (pts.length >= 2) {
      set({ customRoute: pts, routeId: 'custom', drawing: false, progressMeters: 0, isPlaying: false });
      get().pushEvent('success', `Custom route created (${pts.length} waypoints)`);
    } else {
      set({ drawing: false, draftPoints: [] });
    }
  },
  cancelDraw: () => set({ drawing: false, draftPoints: [] }),

  pushEvent: (type, message) =>
    set((s) => ({
      events: [
        { id: ++eventId, time: Date.now(), type, message },
        ...s.events,
      ].slice(0, EVENT_LOG_LIMIT),
    })),
  clearEvents: () => set({ events: [] }),
  requestRecenter: () => set((s) => ({ recenterNonce: s.recenterNonce + 1 })),
}));
