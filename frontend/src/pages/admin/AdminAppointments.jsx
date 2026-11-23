import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Phone,
  RefreshCw,
  Search,
  XCircle,
  AlertCircle,
  Check,
  Eye,
} from "lucide-react";
import {
  getAdminAppointments,
  confirmAppointment,
  cancelAppointment,
  updateAppointmentStatus,
} from "../../api/appointments";
import { formatPrice } from "../../utils/format";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import ToastNotification from "../../components/admin/ToastNotification";

const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmée",
    badgeClass: "bg-forest/15 text-forest border-forest/30",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Annulée",
    badgeClass: "bg-red-100 text-red-900 border-red-300",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Complétée / Honorée",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    icon: Check,
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState(null);

  // Modale de confirmation
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    variant: "warning",
    onConfirm: null,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Modale de détails
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Impossible de charger les réservations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filtrage combiné : statut + recherche
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : appt.status === statusFilter;

      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const name = (appt.customerName || "").toLowerCase();
      const phone = (appt.phone || "").toLowerCase();
      const serviceName = (appt.slot?.service?.name || "").toLowerCase();

      return name.includes(q) || phone.includes(q) || serviceName.includes(q);
    });
  }, [appointments, statusFilter, searchQuery]);

  // Compteurs statistiques par statut
  const counts = useMemo(() => {
    const stats = { ALL: appointments.length, PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0 };
    for (const a of appointments) {
      if (stats[a.status] !== undefined) {
        stats[a.status] += 1;
      }
    }
    return stats;
  }, [appointments]);

  // Actions
  const handleConfirmAction = (appt) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "Confirmer la réservation",
      message: `Voulez-vous confirmer le rendez-vous pour ${appt.customerName} (${appt.slot?.service?.name || "Soin"}) ?`,
      confirmText: "Confirmer le rendez-vous",
      variant: "success",
      onConfirm: async () => {
        setModalLoading(true);
        try {
          const updated = await confirmAppointment(appt.id);
          setAppointments((prev) =>
            prev.map((item) => (item.id === appt.id ? updated : item))
          );
          setToast({
            type: "success",
            title: "Réservation confirmée",
            message: `Le rendez-vous de ${appt.customerName} a été confirmé.`,
          });
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setToast({
            type: "error",
            title: "Erreur de confirmation",
            message: err.message,
          });
        } finally {
          setModalLoading(false);
        }
      },
    });
  };

  const handleCancelAction = (appt) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "Annuler la réservation",
      message: `Êtes-vous sûr de vouloir annuler le rendez-vous de ${appt.customerName} ?\nLe créneau redevient immédiatement disponible pour une autre cliente.`,
      confirmText: "Annuler le rendez-vous",
      variant: "danger",
      onConfirm: async () => {
        setModalLoading(true);
        try {
          const updated = await cancelAppointment(appt.id);
          setAppointments((prev) =>
            prev.map((item) => (item.id === appt.id ? updated : item))
          );
          setToast({
            type: "success",
            title: "Réservation annulée",
            message: `Le rendez-vous de ${appt.customerName} a été annulé.`,
          });
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setToast({
            type: "error",
            title: "Erreur d'annulation",
            message: err.message,
          });
        } finally {
          setModalLoading(false);
        }
      },
    });
  };

  const handleCompleteAction = async (appt) => {
    try {
      const updated = await updateAppointmentStatus(appt.id, "COMPLETED");
      setAppointments((prev) =>
        prev.map((item) => (item.id === appt.id ? updated : item))
      );
      setToast({
        type: "success",
        title: "Séance complétée",
        message: `La séance de ${appt.customerName} a été marquée comme terminée.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        title: "Erreur de mise à jour",
        message: err.message,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* =========================================
          EN-TÊTE DE SECTION
      ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/40 pb-5">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest">
            Réservations Soins & Hijama
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">
            Gérez les rendez-vous pris par vos clientes pour les soins et la Hijama.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl border border-gold/60 bg-ivory px-4 py-2 text-xs md:text-sm font-semibold text-forest hover:bg-cream transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* =========================================
          FILTRES ET RECHERCHE
      ========================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-ivory p-4 rounded-3xl border border-gold/40 shadow-xs">
        {/* Onglets de filtrage */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { key: "ALL", label: "Toutes" },
            { key: "PENDING", label: "En attente" },
            { key: "CONFIRMED", label: "Confirmées" },
            { key: "COMPLETED", label: "Honorées" },
            { key: "CANCELLED", label: "Annulées" },
          ].map(({ key, label }) => {
            const count = counts[key] || 0;
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-forest text-white shadow-xs font-semibold"
                    : "text-muted hover:bg-cream hover:text-charcoal"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-cream text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Barre de recherche */}
        <div className="relative md:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom, téléphone, soin..."
            className="w-full rounded-2xl border border-gold/50 bg-cream py-2 pl-9 pr-4 text-xs md:text-sm outline-none focus:border-forest transition"
          />
        </div>
      </div>

      {/* =========================================
          CONTENU PRINCIPAL : LISTE / TABLEAU
      ========================================= */}
      {loading && appointments.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader label="Chargement des réservations..." />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-800 text-sm">
          <AlertCircle size={24} className="mx-auto mb-2 text-red-600" />
          <p>{error}</p>
          <Button onClick={fetchAppointments} size="sm" className="mt-4">
            Réessayer
          </Button>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-3xl border border-gold/40 bg-ivory p-12 text-center shadow-xs">
          <CalendarCheck size={40} className="mx-auto text-muted/60 mb-3" />
          <h3 className="font-heading text-xl text-forest">
            Aucune réservation trouvée
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "Aucune réservation ne correspond à vos filtres actuels."
              : "Aucune réservation enregistrée pour le moment."}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-gold/40 bg-ivory shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gold/30 bg-cream/60 text-muted uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Cliente</th>
                  <th className="py-3.5 px-4 font-semibold">Soin / Service</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Heure</th>
                  <th className="py-3.5 px-4 font-semibold">Statut</th>
                  <th className="py-3.5 px-4 font-semibold">Tarif</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/20">
                {filteredAppointments.map((appt) => {
                  const statusInfo = STATUS_CONFIG[appt.status] || {
                    label: appt.status,
                    badgeClass: "bg-cream text-charcoal",
                  };
                  const serviceName = appt.slot?.service?.name || "Service Soin";
                  const startAt = appt.slot?.startAt;
                  const price = appt.slot?.service?.price;

                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-cream/40 transition group"
                    >
                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal">
                          {appt.customerName}
                        </div>
                        <a
                          href={`tel:${appt.phone}`}
                          className="text-[11px] text-muted hover:text-forest flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={12} />
                          {appt.phone}
                        </a>
                      </td>

                      {/* Soin */}
                      <td className="py-3.5 px-4">
                        <span className="font-heading text-forest font-semibold block">
                          {serviceName}
                        </span>
                        {appt.slot?.service?.durationMinutes && (
                          <span className="text-[11px] text-muted">
                            Durée : {appt.slot.service.durationMinutes} min
                          </span>
                        )}
                      </td>

                      {/* Date & Heure du créneau */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-charcoal">
                          {formatDate(startAt)}
                        </div>
                        <span className="text-[11px] text-muted">
                          Pris le {formatDate(appt.createdAt)}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Tarif */}
                      <td className="py-3.5 px-4 font-semibold text-forest">
                        {price ? formatPrice(price) : "Sur devis"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAppointment(appt)}
                            className="p-1.5 rounded-lg border border-gold/40 hover:bg-cream text-charcoal transition"
                            title="Détails"
                            aria-label="Voir les détails"
                          >
                            <Eye size={15} />
                          </button>

                          {appt.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleConfirmAction(appt)}
                              className="px-2.5 py-1 rounded-lg bg-forest text-white hover:bg-forest-dark text-xs font-medium transition"
                            >
                              Confirmer
                            </button>
                          )}

                          {appt.status === "CONFIRMED" && (
                            <button
                              type="button"
                              onClick={() => handleCompleteAction(appt)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-medium transition"
                            >
                              Honorée
                            </button>
                          )}

                          {["PENDING", "CONFIRMED"].includes(appt.status) && (
                            <button
                              type="button"
                              onClick={() => handleCancelAction(appt)}
                              className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium transition"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          MODALE DÉTAIL D'UNE RÉSERVATION
      ========================================= */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xl animate-scaleIn space-y-5">
            <div className="flex items-start justify-between border-b border-gold/30 pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Détail du rendez-vous
                </span>
                <h3 className="font-heading text-2xl font-bold text-forest">
                  {selectedAppointment.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="text-muted hover:text-charcoal p-1 rounded-lg hover:bg-cream"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-3.5">
                <span className="text-muted block text-xs mb-1">Téléphone</span>
                <a
                  href={`tel:${selectedAppointment.phone}`}
                  className="font-semibold text-forest hover:underline flex items-center gap-1.5"
                >
                  <Phone size={14} />
                  {selectedAppointment.phone}
                </a>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-3.5">
                <span className="text-muted block text-xs mb-1">Statut</span>
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    STATUS_CONFIG[selectedAppointment.status]?.badgeClass
                  }`}
                >
                  {STATUS_CONFIG[selectedAppointment.status]?.label || selectedAppointment.status}
                </span>
              </div>

              <div className="col-span-2 rounded-2xl border border-gold/30 bg-cream/40 p-3.5">
                <span className="text-muted block text-xs mb-1">Service réservé</span>
                <p className="font-heading text-lg font-bold text-forest">
                  {selectedAppointment.slot?.service?.name || "Soin / Hijama"}
                </p>
                {selectedAppointment.slot?.service?.description && (
                  <p className="text-xs text-charcoal/80 mt-1">
                    {selectedAppointment.slot.service.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                  <span>
                    Durée : {selectedAppointment.slot?.service?.durationMinutes || 60} min
                  </span>
                  <span>
                    Tarif :{" "}
                    <strong className="text-forest">
                      {selectedAppointment.slot?.service?.price
                        ? formatPrice(selectedAppointment.slot.service.price)
                        : "Sur devis"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="col-span-2 rounded-2xl border border-gold/30 bg-cream/40 p-3.5">
                <span className="text-muted block text-xs mb-1">Créneau horaire</span>
                <p className="font-semibold text-charcoal">
                  Début : {formatDate(selectedAppointment.slot?.startAt)}
                </p>
                <p className="text-xs text-muted">
                  Fin : {formatDate(selectedAppointment.slot?.endAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppointment(null)}
              >
                Fermer
              </Button>

              {selectedAppointment.status === "PENDING" && (
                <Button
                  size="sm"
                  onClick={() => {
                    const appt = selectedAppointment;
                    setSelectedAppointment(null);
                    handleConfirmAction(appt);
                  }}
                >
                  Confirmer le RDV
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale de Confirmation dynamique */}
      <ConfirmationModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
        loading={modalLoading}
      />

      {/* Notification Toast */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
