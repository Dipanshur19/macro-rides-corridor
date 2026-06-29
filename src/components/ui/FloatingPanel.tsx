import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface FloatingPanelProps {
  title: string;
  icon?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  width?: number;
}

export default function FloatingPanel({
  title,
  icon,
  onClose,
  children,
  className,
  width = 290,
}: FloatingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{ width }}
      className={cn(
        'pointer-events-auto overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-panel backdrop-blur-md',
        className
      )}
    >
      <header className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {icon}
          {title}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-0.5 text-faint transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={15} />
          </button>
        )}
      </header>
      <div>{children}</div>
    </motion.div>
  );
}
