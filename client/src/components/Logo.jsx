export default function Logo({ size = 'md' }) {
  const fontSize =
    size === 'sm' ? '1.05rem' : size === 'lg' ? '1.6rem' : '1.35rem';
  const boxSize = size === 'sm' ? 26 : size === 'lg' ? 34 : 30;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <span
      className="brand"
      style={{
        fontSize,
      }}
    >
      <span
        style={{
          width: boxSize,
          height: boxSize,
          borderRadius: 8,
          background: 'var(--text)',
          color: 'var(--lime)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 19 L12 5 L19 19"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="14" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span>Aptify</span>
      <span className="brand-accent">AI</span>
    </span>
  );
}
