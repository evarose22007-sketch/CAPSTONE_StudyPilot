/** Loading, error and empty states shared by every screen. */

export function Loading({ label = 'Loading' }) {
  return (
    <div className="loading" role="status">
      <svg viewBox="0 0 120 24" aria-hidden="true" focusable="false">
        <path className="loading__line" d="M4 14c14-6 22 6 36 0s22-6 36 0 22 6 40-2" />
      </svg>
      <span>{label}…</span>
    </div>
  );
}

export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="notice notice--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--quiet btn--small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ illustration, title, children, action }) {
  return (
    <div className="empty">
      {illustration}
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
