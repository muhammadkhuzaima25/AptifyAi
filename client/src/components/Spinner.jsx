export default function Spinner({ label, size = 'md' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '40px 20px',
      }}
    >
      <div
        className="spinner"
        style={
          size === 'sm'
            ? { width: 28, height: 28, borderWidth: 3 }
            : undefined
        }
      />
      {label && (
        <div
          className="mono"
          style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
