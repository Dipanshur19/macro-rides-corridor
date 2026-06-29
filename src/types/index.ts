import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';

/** GeoJSON coordinate order: [lng, lat]. Canonical across the spatial engine. */
export type LngLat = [number, number];
/** Leaflet coordinate order: [lat, lng]. Only used at the render boundary. */
export type LatLng = [number, number];

export type RouteCategory = 'Business' | 'Residential' | 'Airport';

export interface RouteDef {
  id: string;
  name: string;
  category: RouteCategory;
  description: string;
  coordinates: LngLat[];
}

export interface PickupPoint {
  id: string;
  name: string;
  category: string;
  lng: number;
  lat: number;
}

/** A pickup point after running through the eligibility pipeline. */
export interface ClassifiedPickup extends PickupPoint {
  cell: string; // H3 index at the active resolution
  candidate: boolean; // passed the H3 candidate (broad-phase) filter
  eligible: boolean; // passed the exact point-in-polygon (narrow-phase) test
  distanceMeters: number;
  zone: string | null;
}

export interface ZoneProps {
  id: string;
  name: string;
  type: string;
  color: string;
}

export type ZoneFeature = Feature<Polygon, ZoneProps>;
export type ZoneCollection = FeatureCollection<Polygon, ZoneProps>;

export interface CorridorResult {
  bufferFeature: Feature<Polygon | MultiPolygon> | null;
  cells: Set<string>;
}

export interface PipelineStats {
  total: number;
  candidates: number;
  eligible: number;
  rejected: number;
  cellCount: number;
  areaKm2: number;
  routeKm: number;
  processingMs: number;
}

export interface ZoneStat {
  id: string;
  name: string;
  color: string;
  total: number;
  eligible: number;
}

export type CorridorMode = 'ahead' | 'full';
export type ViewMode = '2d' | '3d';
export type Theme = 'light' | 'dark';

export type EventType = 'info' | 'success' | 'warning' | 'zone' | 'system';

export interface EventLogEntry {
  id: number;
  time: number;
  type: EventType;
  message: string;
}

export interface LayerVisibility {
  route: boolean;
  corridor: boolean;
  h3: boolean;
  zones: boolean;
  pickups: boolean;
  ineligible: boolean;
  heatmap: boolean;
}
