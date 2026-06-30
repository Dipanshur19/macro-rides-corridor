export interface ShortcutDef {
  keys: string;
  label: string;
}

export const SHORTCUTS: ShortcutDef[] = [
  { keys: 'Space', label: 'Play / pause simulation' },
  { keys: 'R', label: 'Reset driver to start' },
  { keys: '1 / 2 / 5', label: 'Set playback speed' },
  { keys: 'H', label: 'Toggle H3 hexagon grid' },
  { keys: 'C', label: 'Toggle 350 m corridor' },
  { keys: 'Z', label: 'Toggle service zones' },
  { keys: 'M', label: 'Switch 2D / 3D map' },
  { keys: 'F', label: 'Toggle camera follow' },
  { keys: 'T', label: 'Toggle light / dark theme' },
  { keys: 'E', label: 'Toggle event log' },
  { keys: 'P', label: 'Toggle performance panel' },
  { keys: '/', label: 'Focus search' },
  { keys: '?', label: 'Show this shortcuts panel' },
];
