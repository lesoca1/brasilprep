export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <p className="eyebrow">BRASILPREP</p>
      <p>Carregando seu espaço...</p>
      <div className="skeleton" aria-hidden="true" />
    </div>
  );
}
