export default function ImagePlaceholder({ className = "", label = "Image à venir" }) {
  return (
    <div
      className={`flex items-center justify-center bg-sage/15 text-center ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="px-4 text-xs tracking-[0.2em] text-muted uppercase">
        {label}
      </span>
    </div>
  );
}
