export function EmptyState({
  title,
  message,
  onRetry,
  action,
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-icon">🏠</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {(onRetry || action) && (
        <div className="empty-actions">
          {onRetry && (
            <button className="btn btn-primary" onClick={onRetry}>
              Réessayer
            </button>
          )}
          {action && (
            <button className="btn btn-ghost" onClick={action.onClick}>
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
