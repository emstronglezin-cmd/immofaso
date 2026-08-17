export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton sk-thumb" />
      <div className="sk-pad">
        <div className="skeleton sk-line" />
        <div className="skeleton sk-line short" />
        <div className="skeleton sk-line mid" />
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div>
      <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
      <div style={{ paddingTop: 20 }}>
        <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '80%' }} />
      </div>
    </div>
  );
}
