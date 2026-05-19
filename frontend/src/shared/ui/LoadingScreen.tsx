export function LoadingScreen({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="page-shell page-shell--center">
      <div className="loading-state" role="status" aria-live="polite">
        <span className="loading-spinner" />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
