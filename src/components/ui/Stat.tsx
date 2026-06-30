import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import AnimatedNumber from './AnimatedNumber';

interface StatProps {
  value: string | number;
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'primary' | 'danger';
  mono?: boolean;
  decimals?: number;
  suffix?: string;
}

const toneMap: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-text',
  success: 'text-success',
  warning: 'text-warning',
  primary: 'text-primary',
  danger: 'text-danger',
};

export default function Stat({ value, label, tone = 'default', mono, decimals, suffix }: StatProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="rounded-xl border border-border bg-surface-2/60 px-3 py-2.5 hover:border-border-strong"
    >
      <div className={cn('text-xl font-bold leading-none', toneMap[tone], mono && 'font-mono')}>
        {typeof value === 'number' ? <AnimatedNumber value={value} decimals={decimals} /> : value}
        {suffix && <span className="ml-0.5 text-sm font-semibold opacity-70">{suffix}</span>}
      </div>
      <div className="mt-1.5 text-2xs text-muted">{label}</div>
    </motion.div>
  );
}
