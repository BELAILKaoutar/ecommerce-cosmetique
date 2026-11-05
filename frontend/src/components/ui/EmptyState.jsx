export default function EmptyState({ icon, title, description, children }) {
  return (
    <div className="rounded-3xl border border-gold/50 bg-ivory px-8 py-16 text-center shadow-[0_12px_40px_rgba(41,45,39,0.04)]">
      {icon ? (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/70 bg-cream text-forest shadow-inner">
          {icon}
        </div>
      ) : (
        <div className="mx-auto mb-6 h-16 w-16 rounded-full border border-gold/70 bg-cream" />
      )}
      {title ? (
        <h2 className="font-heading text-3xl text-forest">{title}</h2>
      ) : null}
      {description ? (
        <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}
