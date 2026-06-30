import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

/** Binds global keyboard shortcuts (ignored while typing in inputs). */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') target.blur();
        return;
      }
      const s = useStore.getState();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          s.togglePlay();
          break;
        case 'r':
        case 'R':
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
        case 'H':
          s.toggleLayer('h3');
          break;
        case 'c':
        case 'C':
          s.toggleLayer('corridor');
          break;
        case 'z':
        case 'Z':
          s.toggleLayer('zones');
          break;
        case 'm':
        case 'M':
          s.toggleViewMode();
          break;
        case 't':
        case 'T':
          s.toggleTheme();
          break;
        case 'f':
        case 'F':
          s.toggleFollow();
          break;
        case 'e':
        case 'E':
          s.togglePanel('eventLog');
          break;
        case 'p':
        case 'P':
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
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
