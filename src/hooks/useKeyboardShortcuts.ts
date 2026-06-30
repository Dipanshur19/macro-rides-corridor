import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

/**
 * Binds global keyboard shortcuts.
 * Uses the CAPTURE phase on window so the shortcuts fire even when the
 * Leaflet / deck.gl canvas has focus (those libraries attach their own
 * key handlers on the canvas during the bubble phase).
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Never hijack browser/OS combos (Cmd+R, Ctrl+L, etc.).
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      ) {
        if (e.key === 'Escape') t.blur();
        return;
      }

      const s = useStore.getState();

      // Space (play/pause) — match both key and code for layout robustness.
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        s.togglePlay();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          s.reset();
          break;
        case '1':
          s.setMultiplier(1);
          break;
        case '2':
          s.setMultiplier(2);
          break;
        case '5':
          s.setMultiplier(5);
          break;
        case 'h':
          s.toggleLayer('h3');
          break;
        case 'c':
          s.toggleLayer('corridor');
          break;
        case 'z':
          s.toggleLayer('zones');
          break;
        case 'm':
          s.toggleViewMode();
          break;
        case 't':
          s.toggleTheme();
          break;
        case 'f':
          s.toggleFollow();
          break;
        case 'e':
          s.togglePanel('eventLog');
          break;
        case 'p':
          s.togglePanel('performance');
          break;
        case '/':
          e.preventDefault();
          document.getElementById('global-search')?.focus();
          break;
        case '?':
          s.togglePanel('shortcuts');
          break;
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);
}
