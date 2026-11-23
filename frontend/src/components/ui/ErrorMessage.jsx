export default function ErrorMessage({ title = "Une erreur est survenue", message }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left text-charcoal"
    >
      <p className="font-medium text-forest">{title}</p>
      {message ? <p className="mt-1 text-sm text-muted">{message}</p> : null}
    </div>
  );
}
