export default function BarChart({ data = [], max = 100, height = 220 }) {
  if (!data.length) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--secondary)',
          fontSize: '0.9rem',
        }}
      >
        No data yet
      </div>
    );
  }
  const safeMax = Math.max(max, ...data.map((d) => d.value || 0), 10);
  return (
    <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
      {data.map((d, i) => {
        const h = ((d.value || 0) / safeMax) * (height - 40);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
            }}
          >
            <div
              className="mono"
              style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}
            >
              {typeof d.value === 'number' ? Math.round(d.value) : d.value}
            </div>
            <div
              style={{
                width: '100%',
                height: Math.max(4, h),
                background:
                  d.highlight || i === data.length - 1
                    ? 'var(--lime)'
                    : 'var(--text)',
                borderRadius: '6px 6px 0 0',
                transition: 'height 800ms cubic-bezier(0.4,0,0.2,1)',
                transitionDelay: `${i * 80}ms`,
                minWidth: 8,
              }}
            />
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--secondary)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
              }}
            >
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
