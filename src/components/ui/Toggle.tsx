import type { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  swatch?: string;
}

export default function Toggle({ checked, onChange, label, swatch }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between py-1.5 text-[13px]"
    >
      <span className="flex items-center gap-2 text-text">
        {swatch && (
          <span
            className="h-3 w-3 rounded-sm"
            style={{ background: swatch }}
          />
        )}
        {label}
      </span>
      <span
        className={cn(
          'relative h-[20px] w-[36px] rounded-full border transition-colors',
          checked ? 'border-primary bg-primary/25' : 'border-border bg-surface-2'
        )}
      >
        <span
          className={cn(
            'absolute top-[2px] h-[14px] w-[14px] rounded-full transition-all',
            checked ? 'left-[18px] bg-primary' : 'left-[2px] bg-faint'
          )}
        />
      </span>
    </button>
  );
}
