import { useScrollReveal, useCountUp } from '../hooks/useAnimations.js';

export default function CountUp({ value, suffix = '', decimals = 0, prefix = '' }) {
  const [ref, visible] = useScrollReveal();
  const v = useCountUp(value, 1400, visible);
  const display = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
