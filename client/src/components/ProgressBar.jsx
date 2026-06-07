export default function ProgressBar({ value, max = 100, color = 'var(--lime)' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      style={{
        width: '100%',
        height: 8,
        background: 'var(--bg)',
        borderRadius: 999,
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 999,
          transition: 'width 600ms ease',
        }}
      />
    </div>
  );
}
