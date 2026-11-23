import { useEffect } from "react";
import { AlertTriangle, CheckCircle, Info, Trash2, X } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "warning", // "danger" | "warning" | "success" | "info"
  loading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100 text-red-700",
      icon: Trash2,
      btnBg: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    },
    warning: {
      iconBg: "bg-amber-100 text-amber-700",
      icon: AlertTriangle,
      btnBg: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
    },
    success: {
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle,
      btnBg: "bg-forest hover:bg-forest-dark text-white focus:ring-forest",
    },
    info: {
      iconBg: "bg-blue-100 text-blue-700",
      icon: Info,
      btnBg: "bg-forest hover:bg-forest-dark text-white focus:ring-forest",
    },
  }[variant] || {
    iconBg: "bg-amber-100 text-amber-700",
    icon: AlertTriangle,
    btnBg: "bg-forest hover:bg-forest-dark text-white",
  };

  const IconComponent = variantStyles.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-gold/40 bg-ivory shadow-xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${variantStyles.iconBg}`}
            >
              <IconComponent size={24} />
            </div>

            <div className="flex-1">
              <h3
                id="modal-title"
                className="font-heading text-xl font-bold text-forest"
              >
                {title}
              </h3>
              <p className="mt-2 text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-muted hover:text-charcoal transition p-1 rounded-lg hover:bg-cream"
              aria-label="Fermer la modale"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gold/30 bg-cream/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gold/60 bg-white px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-cream transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition shadow-xs disabled:opacity-50 ${variantStyles.btnBg}`}
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Traitement..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
