export function Loading({ label = 'Carregando…' }) {
  return (
    <div className="pp-loading">
      <div className="pp-spinner" />
      <p className="pp-mt-4">{label}</p>
    </div>
  );
}

export function Empty({ children }) {
  return <div className="pp-empty">{children}</div>;
}

export function ErrorBox({ children }) {
  return <div className="pp-error">{children}</div>;
}
