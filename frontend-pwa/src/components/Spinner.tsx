export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Chargement"
    />
  );
}