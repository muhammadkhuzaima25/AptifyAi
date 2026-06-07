import { useScrollReveal } from '../hooks/useAnimations.js';

export default function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}) {
  const [ref, visible] = useScrollReveal();
  const delayClass = delay ? `reveal-delay-${delay}` : '';
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${delayClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
