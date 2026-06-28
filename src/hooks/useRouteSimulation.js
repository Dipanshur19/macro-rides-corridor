// ---------------------------------------------------------------------------
// Drives the simulated "live" driver. Advances a distance-along-route value
// (metres) using requestAnimationFrame for smooth movement, scaled by the
// chosen driver speed. Exposes play / pause / reset / seek controls.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState, useCallback } from 'react';

export function useRouteSimulation(totalMeters, initialSpeedKmh) {
  const [progressMeters, setProgressMeters] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedKmh, setSpeedKmh] = useState(initialSpeedKmh);

  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const speedRef = useRef(speedKmh);
  const totalRef = useRef(totalMeters);

  speedRef.current = speedKmh;
  totalRef.current = totalMeters;

  // Reset progress whenever the underlying route length changes (new route).
  useEffect(() => {
    setProgressMeters(0);
    setIsPlaying(false);
  }, [totalMeters]);

  useEffect(() => {
    if (!isPlaying) {
      lastTsRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dtSec = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const metersPerSec = (speedRef.current * 1000) / 3600;
      setProgressMeters((prev) => {
        const next = prev + metersPerSec * dtSec;
        if (next >= totalRef.current) {
          setIsPlaying(false);
          return totalRef.current;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const play = useCallback(() => {
    setProgressMeters((p) => (p >= totalRef.current ? 0 : p));
    setIsPlaying(true);
  }, []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(
    () => (isPlaying ? pause() : play()),
    [isPlaying, play, pause]
  );
  const reset = useCallback(() => {
    setIsPlaying(false);
    setProgressMeters(0);
  }, []);
  const seek = useCallback((m) => {
    setIsPlaying(false);
    setProgressMeters(m);
  }, []);

  return {
    progressMeters,
    isPlaying,
    speedKmh,
    setSpeedKmh,
    play,
    pause,
    toggle,
    reset,
    seek,
  };
}
