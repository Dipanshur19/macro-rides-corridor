import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useActiveRoute } from './useActiveRoute';

/**
 * Advances the driver along the route using requestAnimationFrame.
 * Reads live settings via useStore.getState() inside the loop so the loop
 * itself never re-subscribes / re-renders the component each frame.
 */
export function useSimulation() {
  const { totalMeters } = useActiveRoute();
  const isPlaying = useStore((s) => s.isPlaying);
  const totalRef = useRef(totalMeters);
  totalRef.current = totalMeters;

  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last: number | null = null;

    const tick = (ts: number) => {
      if (last == null) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;

      const { progressMeters, speedKmh, speedMultiplier, setProgress, pause, pushEvent } =
        useStore.getState();
      const metersPerSec = (speedKmh * speedMultiplier * 1000) / 3600;
      const next = progressMeters + metersPerSec * dt;

      if (next >= totalRef.current) {
        setProgress(totalRef.current);
        pause();
        pushEvent('success', 'Route completed');
        return;
      }
      setProgress(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);
}
