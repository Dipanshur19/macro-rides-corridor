import { cn } from '@/utils/helpers';

interface SegmentedProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}

export default function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedProps<T>) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-md font-semibold transition-colors',
            size === 'sm' ? 'px-2 py-1 text-2xs' : 'px-2.5 py-1.5 text-xs',
            value === o.value
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-text'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
