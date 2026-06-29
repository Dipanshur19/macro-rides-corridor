import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { getRouteById } from '@/data/routes';
import { routeLengthMeters } from '@/services/routeService';
import type { LngLat } from '@/types';

export interface ActiveRoute {
  coords: LngLat[];
  totalMeters: number;
}

/** Resolves the active route (preset or custom) and its length. */
export function useActiveRoute(): ActiveRoute {
  const routeId = useStore((s) => s.routeId);
  const customRoute = useStore((s) => s.customRoute);
  return useMemo(() => {
    const coords = customRoute ?? getRouteById(routeId).coordinates;
    return { coords, totalMeters: routeLengthMeters(coords) };
  }, [routeId, customRoute]);
}
