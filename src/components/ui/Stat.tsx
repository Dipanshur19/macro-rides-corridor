import { cn } from '@/utils/helpers';

interface StatProps {
  value: string | number;
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'primary' | 'danger';
  mono?: boolean;
}

const toneMap: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-text',
  success: 'text-success',
  warning: 'text-warning',
  primary: 'text-primary',
  danger: 'text-danger',
};

export default function Stat({ value, label, tone = 'default', mono }: StatProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/60 px-3 py-2.5">
      <div className={cn('text-xl font-bold leading-none', toneMap[tone], mono && 'font-mono')}>
        {value}
      </div>
      <div className="mt-1.5 text-2xs text-muted">{label}</div>
    </div>
  );
}
