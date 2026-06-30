import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { formatClock } from '@/utils/helpers';
import type { EventType } from '@/types';

const emoji: Record<EventType, string> = {
  info: '💡',
  success: '✅',
  warning: '⚠️',
  zone: '📍',
  system: '⚙️',
};

export default function EventLog() {
  const events = useStore((s) => s.events);
  const clear = useStore((s) => s.clearEvents);
  const close = useStore((s) => s.closePanel);

  return (
    <FloatingPanel
      title="Live Event Log"
      icon={<span>📡</span>}
      onClose={() => close('eventLog')}
      width={300}
    >
      <div className="flex items-center justify-between border-b border-border px-3.5 py-1.5">
        <span className="text-2xs text-muted">{events.length} events</span>
        <button
          onClick={clear}
          className="flex items-center gap-1 text-2xs text-faint transition-colors hover:text-danger"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>
      <div className="max-h-[240px] overflow-y-auto px-2 py-1.5">
        {events.length === 0 && (
          <p className="px-2 py-4 text-center text-2xs text-faint">No events yet.</p>
        )}
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2/60"
            >
              <span className="mt-px text-xs leading-none">{emoji[e.type]}</span>
              <span className="flex-1 text-2xs leading-snug">{e.message}</span>
              <span className="flex-none font-mono text-[10px] text-faint">
                {formatClock(e.time)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FloatingPanel>
  );
}
