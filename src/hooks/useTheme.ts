import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

/** Applies the active theme to <html> and persists the choice. */
export function useTheme() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('mr-theme', theme);
  }, [theme]);
}
