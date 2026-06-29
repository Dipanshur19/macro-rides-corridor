import type { LatLng } from '@/types';

// Map centred on South-Central Delhi NCR (covers CP, South Delhi, Aerocity/IGI).
export const MAP_CENTER: LatLng = [28.57, 77.155];
export const MAP_ZOOM = 12;

// Core spatial defaults.
export const DEFAULT_BUFFER_METERS = 350; // assignment corridor half-width
export const MIN_BUFFER_METERS = 100;
export const MAX_BUFFER_METERS = 750;

export const DEFAULT_H3_RESOLUTION = 10; // ~66 m edge
export const MIN_H3_RESOLUTION = 8;
export const MAX_H3_RESOLUTION = 11;

export const DEFAULT_LOOKAHEAD_METERS = 1800;
export const MIN_LOOKAHEAD_METERS = 400;
export const MAX_LOOKAHEAD_METERS = 4000;
export const LOOK_BEHIND_METERS = 250;

export const DEFAULT_SPEED_KMH = 32;
export const SPEED_MULTIPLIERS = [1, 2, 5] as const;

// Rebuild the corridor only every N metres of movement (keeps 60 FPS).
export const CORRIDOR_SNAP_METERS = 25;

export const PICKUP_COUNT = 500;
export const PICKUP_SEED = 73;

export const EVENT_LOG_LIMIT = 60;

// H3 resolution reference (approx hexagon edge length in metres).
export const H3_RES_INFO: Record<number, { edge: number; label: string }> = {
  8: { edge: 461, label: 'Res 8' },
  9: { edge: 174, label: 'Res 9' },
  10: { edge: 66, label: 'Res 10' },
  11: { edge: 25, label: 'Res 11' },
};

// Free, token-less basemap tiles (CARTO). Separate styles per theme.
export const TILES = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    // deck.gl TileLayer needs a concrete subdomain (no {s} templating).
    deckUrl:
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    deckUrl:
      'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  },
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

// 3D view initial camera.
export const DECK_INITIAL_VIEW = {
  longitude: MAP_CENTER[1],
  latitude: MAP_CENTER[0],
  zoom: 11.5,
  pitch: 50,
  bearing: -18,
};
