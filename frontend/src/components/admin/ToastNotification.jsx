import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastNotification({ toast, onDismiss }) {
  if (!toast) return null;

  const { type = "info", message, title } = toast;

  const configs = {
    success: {
      bg: "bg-emerald-50 border-emerald-300 text-emerald-950",
      iconBg: "text-emerald-700",
      icon: CheckCircle2,
      defaultTitle: "Opération réussie",
    },
    error: {
      bg: "bg-red-50 border-red-300 text-red-950",
      iconBg: "text-red-700",
      icon: AlertCircle,
      defaultTitle: "Une erreur est survenue",
    },
    info: {
      bg: "bg-blue-50 border-blue-300 text-blue-950",
      iconBg: "text-blue-700",
      icon: Info,
      defaultTitle: "Information",
    },
  }[type] || {
    bg: "bg-stone-50 border-stone-300 text-stone-900",
    iconBg: "text-stone-700",
    icon: Info,
    defaultTitle: "Notification",
  };

  const IconComponent = configs.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-2xl border p-4 shadow-lg transition-all animate-slideUp ${configs.bg}`}
    >
      <IconComponent size={22} className={`shrink-0 mt-0.5 ${configs.iconBg}`} />

      <div className="flex-1">
        <h4 className="text-sm font-semibold">{title || configs.defaultTitle}</h4>
        {message && <p className="mt-1 text-sm leading-snug opacity-90">{message}</p>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 opacity-70 hover:opacity-100 transition"
          aria-label="Fermer la notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
