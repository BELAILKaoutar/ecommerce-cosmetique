export default function Loader({ label = "Chargement…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-sage border-t-forest" />
      <span className="text-sm tracking-wide">{label}</span>
    </div>
  );
}
