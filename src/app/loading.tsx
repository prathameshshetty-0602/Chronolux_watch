export default function Loading() {
  return (
    <div className="container section" aria-label="Loading">
      <div className="skeleton skeleton-line" style={{ width: 180 }} />
      <div className="skeleton skeleton-line" style={{ width: 320, height: 36, marginTop: 17 }} />
      <div className="product-grid" style={{ marginTop: 35 }}>
        {Array.from({ length: 4 }).map((_, index) => <div className="skeleton skeleton-card" key={index} />)}
      </div>
    </div>
  );
}
