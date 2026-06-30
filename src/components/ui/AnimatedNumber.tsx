import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

/** Smoothly animates between numeric values (count-up / count-down). */
export default function AnimatedNumber({
  value,
  decimals = 0,
  locale = true,
}: {
  value: number;
  decimals?: number;
  locale?: boolean;
}) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) =>
    decimals > 0
      ? v.toFixed(decimals)
      : locale
      ? Math.round(v).toLocaleString('en-IN')
      : String(Math.round(v))
  );

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span>{text}</motion.span>;
}
