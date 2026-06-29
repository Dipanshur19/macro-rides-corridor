import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

/**
 * Emits live operational events as the simulation state changes:
 *  - driver crossing into a new service zone
 *  - the eligible-pickup count changing as the corridor slides
 */
export function useEventFeed(eligible: number, driverZone: string | null) {
  const pushEvent = useStore((s) => s.pushEvent);
  const prevEligible = useRef<number | null>(null);
  const prevZone = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (prevZone.current === undefined) {
      prevZone.current = driverZone;
      return;
    }
    if (driverZone !== prevZone.current) {
      if (driverZone) pushEvent('zone', `Driver entered ${driverZone}`);
      else pushEvent('zone', 'Driver left all service zones');
      prevZone.current = driverZone;
    }
  }, [driverZone, pushEvent]);

  useEffect(() => {
    if (prevEligible.current === null) {
      prevEligible.current = eligible;
      return;
    }
    const delta = eligible - prevEligible.current;
    if (delta !== 0) {
      pushEvent(
        delta > 0 ? 'success' : 'warning',
        `Eligible pickups ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} -> ${eligible}`
      );
      prevEligible.current = eligible;
    }
  }, [eligible, pushEvent]);
}
