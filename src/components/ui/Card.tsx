import type { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, icon, action, children, className }: CardProps) {
  return (
    <section className={cn('border-b border-border px-4 py-4', className)}>
      {title && (
        <header className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {icon}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
