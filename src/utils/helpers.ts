/** Tailwind-friendly conditional class joiner. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** "#rrggbb" -> [r, g, b]. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Deterministic PRNG (mulberry32) for reproducible mock data. */
export function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export function formatKm(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatMs(ms: number): string {
  return ms < 1 ? '<1 ms' : `${ms.toFixed(ms < 10 ? 1 : 0)} ms`;
}

export function formatClock(time: number): string {
  return new Date(time).toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
