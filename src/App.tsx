import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import Dashboard from '@/pages/Dashboard';
import LoadingScreen from '@/components/three/LoadingScreen';

export default function App() {
  useTheme();
  useKeyboardShortcuts();
  const theme = useStore((s) => s.theme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Dashboard />
      <AnimatePresence>
        {loading && <LoadingScreen key="loading" dark={theme === 'dark'} />}
      </AnimatePresence>
    </>
  );
}
