import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  PackageCheck,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  cancelOrder,
  confirmOrder,
  getAdminOrders,
  updateOrderStatus,
} from "../../api/orders";
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
  SHIPPED: {
    label: "Expédiée",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
    icon: Truck,
  },
  DELIVERED: {
    label: "Livrée",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Annulée",
    badgeClass: "bg-red-100 text-red-900 border-red-300",
    icon: XCircle,
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  // Modale de détails
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modale de confirmation
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    variant: "warning",
    onConfirm: null,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setFetchError(null);
    try {
      const data = await getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(
        err.message || "Impossible de charger les commandes."
      );
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Action : Confirmer commande
  const requestConfirm = (order) => {
    setModalConfig({
      isOpen: true,
      title: "Confirmer la commande",
      message: `Voulez-vous confirmer la commande ${order.orderNumber} ?\nLe stock des articles commandés sera automatiquement déduit.`,
      confirmText: "Confirmer la commande",
      variant: "success",
      onConfirm: async () => {
        setModalLoading(true);
        try {
          const updated = await confirmOrder(order.id);
          setOrders((prev) =>
            prev.map((item) => (item.id === order.id ? updated : item))
          );
          if (selectedOrder?.id === order.id) {
            setSelectedOrder(updated);
          }
          setToast({
            type: "success",
            title: "Commande confirmée",
            message: `La commande ${order.orderNumber} a été validée et le stock déduit.`,
          });
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setToast({
            type: "error",
            title: "Échec de confirmation",
            message: err.message,
          });
        } finally {
          setModalLoading(false);
        }
      },
    });
  };

  // Action : Annuler commande
  const requestCancel = (order) => {
    setModalConfig({
      isOpen: true,
      title: "Annuler la commande",
      message: `Voulez-vous annuler la commande ${order.orderNumber} ?\nLe stock sera automatiquement réintégré si la commande avait été confirmée.`,
      confirmText: "Annuler la commande",
      variant: "danger",
      onConfirm: async () => {
        setModalLoading(true);
        try {
          const updated = await cancelOrder(order.id);
          setOrders((prev) =>
            prev.map((item) => (item.id === order.id ? updated : item))
          );
          if (selectedOrder?.id === order.id) {
            setSelectedOrder(updated);
          }
          setToast({
            type: "success",
            title: "Commande annulée",
            message: `La commande ${order.orderNumber} a été annulée.`,
          });
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setToast({
            type: "error",
            title: "Échec d'annulation",
            message: err.message,
          });
        } finally {
          setModalLoading(false);
        }
      },
    });
  };

  // Action : Changer statut
  const handleUpdateStatus = async (order, nextStatus) => {
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? updated : item))
      );
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(updated);
      }
      setToast({
        type: "success",
        title: "Statut mis à jour",
        message: `La commande ${order.orderNumber} est désormais "${STATUS_CONFIG[nextStatus]?.label || nextStatus}".`,
      });
    } catch (err) {
      setToast({
        type: "error",
        title: "Erreur de statut",
        message: err.message,
      });
    }
  };

  // Filtrage combiné : Statut + Recherche textuelle
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : order.status === statusFilter;

      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const orderNumber = (order.orderNumber || "").toLowerCase();
      const customerName = (order.customerName || "").toLowerCase();
      const customerPhone = (order.customerPhone || "").toLowerCase();
      const city = (order.city || "").toLowerCase();

      return (
        orderNumber.includes(q) ||
        customerName.includes(q) ||
        customerPhone.includes(q) ||
        city.includes(q)
      );
    });
  }, [orders, statusFilter, searchQuery]);

  // Compteurs statistiques par statut
  const counts = useMemo(() => {
    const stats = { ALL: orders.length, PENDING: 0, CONFIRMED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    for (const o of orders) {
      if (stats[o.status] !== undefined) {
        stats[o.status] += 1;
      }
    }
    return stats;
  }, [orders]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/40 pb-5">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest">
            Gestion des commandes
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">
            Visualisez et traitez les commandes des clientes de la boutique.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loadingOrders}
          className="flex items-center gap-2 rounded-2xl border border-gold/60 bg-ivory px-4 py-2 text-xs md:text-sm font-semibold text-forest hover:bg-cream transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loadingOrders ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Barre de filtrage & Recherche */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-ivory p-4 rounded-3xl border border-gold/40 shadow-xs">
        {/* Filtres par statut */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { key: "ALL", label: "Toutes" },
            { key: "PENDING", label: "En attente" },
            { key: "CONFIRMED", label: "Confirmées" },
            { key: "SHIPPED", label: "Expédiées" },
            { key: "DELIVERED", label: "Livrées" },
            { key: "CANCELLED", label: "Annulées" },
          ].map(({ key, label }) => {
            const active = statusFilter === key;
            const count = counts[key] || 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-forest text-white shadow-xs font-semibold"
                    : "text-muted hover:bg-cream hover:text-charcoal"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-cream text-muted"
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
            placeholder="N° commande, client, ville..."
            className="w-full rounded-2xl border border-gold/50 bg-cream py-2 pl-9 pr-4 text-xs md:text-sm outline-none focus:border-forest transition"
          />
        </div>
      </div>

      {/* Liste des commandes */}
      {loadingOrders && orders.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader label="Chargement des commandes..." />
        </div>
      ) : fetchError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-800 text-sm">
          <AlertCircle size={24} className="mx-auto mb-2 text-red-600" />
          <p>{fetchError}</p>
          <Button onClick={fetchOrders} size="sm" className="mt-4">
            Réessayer
          </Button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-gold/40 bg-ivory p-12 text-center shadow-xs">
          <Clock size={40} className="mx-auto text-muted/60 mb-3" />
          <h3 className="font-heading text-xl text-forest">
            Aucune commande trouvée
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "Aucune commande ne correspond aux critères de recherche."
              : "Aucune commande n'a encore été passée sur la boutique."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusCfg.icon;
            const isExpanded = Boolean(expandedOrders[order.id]);

            return (
              <article
                key={order.id}
                className="rounded-3xl border border-gold/40 bg-ivory p-5 shadow-xs transition hover:border-forest/50"
              >
                {/* Ligne principale */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm md:text-base font-bold text-forest">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${statusCfg.badgeClass}`}
                    >
                      <StatusIcon size={13} />
                      {statusCfg.label}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-xs text-muted block">Total TTC</span>
                      <span className="font-heading text-xl md:text-2xl font-bold text-forest">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 rounded-xl border border-gold/50 bg-white px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream transition"
                      >
                        <Eye size={14} />
                        Détails
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="p-1.5 rounded-xl border border-gold/40 hover:bg-cream text-muted transition"
                        title={isExpanded ? "Replier" : "Déplier les articles"}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coordonnées & Boutons d'actions */}
                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs md:text-sm">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-charcoal/80">
                    <span className="font-medium text-charcoal">
                      Cliente : <strong>{order.customerName}</strong>
                    </span>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="flex items-center gap-1 hover:text-forest transition"
                    >
                      <Phone size={13} className="text-muted" />
                      {order.customerPhone}
                    </a>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-muted" />
                      {order.city} — {order.address}
                    </span>
                  </div>

                  {/* Boutons d'actions contextuels */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    {order.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => requestConfirm(order)}
                        className="rounded-xl bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-dark transition"
                      >
                        Confirmer la commande
                      </button>
                    )}

                    {order.status === "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order, "SHIPPED")}
                        className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        Passer à Expédiée
                      </button>
                    )}

                    {order.status === "SHIPPED" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order, "DELIVERED")}
                        className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                      >
                        Marquer Livrée
                      </button>
                    )}

                    {["PENDING", "CONFIRMED"].includes(order.status) && (
                      <button
                        type="button"
                        onClick={() => requestCancel(order)}
                        className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                {/* Section dépliée : articles */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gold/20 animate-fadeIn">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      Articles commandés ({order.items?.length || 0})
                    </h4>
                    <div className="divide-y divide-gold/15 bg-cream/40 rounded-2xl p-3 border border-gold/30">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-medium text-charcoal">
                              {item.productName}
                            </span>
                            <span className="text-muted ml-2">
                              × {item.quantity} ({formatPrice(item.unitPrice)} / u)
                            </span>
                          </div>
                          <span className="font-semibold text-forest">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* =========================================
          MODALE DE DÉTAIL D'UNE COMMANDE
      ========================================= */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gold/40 bg-ivory p-6 md:p-8 shadow-xl animate-scaleIn space-y-6">
            <div className="flex items-start justify-between border-b border-gold/30 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Détail de commande
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-forest mt-0.5">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-cream"
              >
                ✕
              </button>
            </div>

            {/* Coordonnées Client & Statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-4 space-y-2">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                  Informations Cliente
                </span>
                <p className="font-bold text-charcoal text-base">
                  {selectedOrder.customerName}
                </p>
                <p className="flex items-center gap-2 text-charcoal/80">
                  <Phone size={14} className="text-muted" />
                  <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline text-forest">
                    {selectedOrder.customerPhone}
                  </a>
                </p>
                <p className="flex items-center gap-2 text-charcoal/80">
                  <Mail size={14} className="text-muted" />
                  {selectedOrder.customerEmail}
                </p>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-4 space-y-2">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                  Livraison & Date
                </span>
                <p className="flex items-start gap-2 text-charcoal">
                  <MapPin size={15} className="text-muted shrink-0 mt-0.5" />
                  <span>
                    <strong>{selectedOrder.city}</strong> — {selectedOrder.address}
                  </span>
                </p>
                <p className="text-xs text-muted mt-2">
                  Passée le : {formatDate(selectedOrder.createdAt)}
                </p>
                <div className="pt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${
                      STATUS_CONFIG[selectedOrder.status]?.badgeClass
                    }`}
                  >
                    {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Articles commandés */}
            <div>
              <h4 className="font-heading text-lg font-bold text-forest mb-3">
                Articles commandés
              </h4>
              <div className="rounded-2xl border border-gold/30 bg-white overflow-hidden">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-cream/60 border-b border-gold/20 text-muted uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Produit</th>
                      <th className="p-3 text-center">Quantité</th>
                      <th className="p-3 text-right">Prix Unitaire</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/15">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 font-medium text-charcoal">
                          {item.productName}
                        </td>
                        <td className="p-3 text-center font-semibold">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-muted">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="p-3 text-right font-semibold text-forest">
                          {formatPrice(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Récapitulatif Financier */}
            <div className="rounded-2xl border border-gold/30 bg-cream/40 p-4 space-y-2 text-xs md:text-sm">
              <div className="flex justify-between text-charcoal/80">
                <span>Sous-total articles :</span>
                <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal/80">
                <span>Frais de livraison ({selectedOrder.city}) :</span>
                <span className="font-semibold">{formatPrice(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-gold/30 pt-2 text-base font-bold text-forest">
                <span>Total TTC :</span>
                <span className="font-heading text-xl">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Actions dans la modale */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gold/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Fermer
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                {selectedOrder.status === "PENDING" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      requestConfirm(ord);
                    }}
                  >
                    Confirmer la commande
                  </Button>
                )}

                {selectedOrder.status === "CONFIRMED" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder, "SHIPPED")}
                  >
                    Marquer Expédiée
                  </Button>
                )}

                {["PENDING", "CONFIRMED"].includes(selectedOrder.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      requestCancel(ord);
                    }}
                    className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de Confirmation dynamique */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
        loading={modalLoading}
      />

      {/* Notification Toast */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
