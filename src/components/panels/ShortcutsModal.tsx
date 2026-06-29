import { motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SHORTCUTS } from '@/constants/shortcuts';

export default function ShortcutsModal() {
  const close = useStore((s) => s.closePanel);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm"
      onClick={() => close('shortcuts')}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[400px] overflow-hidden rounded-2xl border border-border bg-surface shadow-panel"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Keyboard size={16} /> Keyboard Shortcuts
          </h3>
          <button
            onClick={() => close('shortcuts')}
            className="rounded-md p-1 text-faint hover:bg-surface-2 hover:text-text"
          >
            <X size={16} />
          </button>
        </header>
        <div className="grid grid-cols-1 gap-1 px-4 py-3">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-muted">{s.label}</span>
              <kbd className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-2xs font-semibold">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
