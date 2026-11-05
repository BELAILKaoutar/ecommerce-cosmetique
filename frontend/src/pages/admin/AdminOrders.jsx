import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  cancelOrder,
  confirmOrder,
  getAdminOrders,
  updateOrderStatus,
} from "../../api/orders";
import { formatPrice } from "../../utils/format";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import PageContainer from "../../components/ui/PageContainer";

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
    badgeClass: "bg-sage/30 text-forest border-sage/60",
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
  const { admin, loading: authLoading, error: authError, isAuthenticated, retryAuth } =
    useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    setFetchError(null);
    try {
      const data = await getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(
        err.message ||
          "Impossible de charger les commandes. Vérifiez que le backend et la base de données sont actifs."
      );
    } finally {
      setLoadingOrders(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleConfirm = async (order) => {
    const ok = window.confirm(
      `Confirmer la commande ${order.orderNumber} ?\nLe stock des produits commandés sera immédiatement déduit.`
    );
    if (!ok) return;

    setActionLoadingId(order.id);
    setActionMessage(null);
    try {
      const updated = await confirmOrder(order.id);
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? updated : item))
      );
      setActionMessage({
        type: "success",
        text: `Commande ${order.orderNumber} confirmée avec succès. Stock déduit.`,
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: `Échec de confirmation : ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (order) => {
    const ok = window.confirm(
      `Annuler la commande ${order.orderNumber} ?\nLe stock sera automatiquement restitué si la commande était déjà confirmée.`
    );
    if (!ok) return;

    setActionLoadingId(order.id);
    setActionMessage(null);
    try {
      const updated = await cancelOrder(order.id);
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? updated : item))
      );
      setActionMessage({
        type: "success",
        text: `Commande ${order.orderNumber} annulée.`,
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: `Échec de l'annulation : ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (order, nextStatus) => {
    setActionLoadingId(order.id);
    setActionMessage(null);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? updated : item))
      );
      setActionMessage({
        type: "success",
        text: `Statut de la commande ${order.orderNumber} mis à jour : ${STATUS_CONFIG[nextStatus]?.label || nextStatus}.`,
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: `Échec de mise à jour du statut : ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
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

  if (authLoading) {
    return (
      <section className="py-20">
        <PageContainer>
          <Loader label="Accès automatique à l'espace d'administration (Mode Démo)..." />
        </PageContainer>
      </section>
    );
  }

  if (authError && !isAuthenticated) {
    return (
      <section className="py-20">
        <PageContainer className="max-w-xl text-center">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertCircle size={28} />
            </div>
            <h1 className="font-heading text-3xl text-forest">
              Erreur d’accès à l’espace Admin
            </h1>
            <p className="mt-3 text-sm text-charcoal/80">{authError}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => retryAuth()}>Réessayer la connexion</Button>
              <Button to="/boutique" variant="outline">
                Retour à la boutique
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        {/* En-tête de la page */}
        <div className="flex flex-col justify-between gap-4 border-b border-gold/40 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-forest/10 px-3 py-0.5 text-xs font-medium text-forest">
                <ShieldCheck size={14} /> Mode Démo Transparent
              </span>
              {admin?.email ? (
                <span className="text-xs text-muted">
                  Connecté en tant que : <strong>{admin.name || admin.email}</strong>
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 font-heading text-3xl text-forest sm:text-4xl">
              Gestion des commandes
            </h1>
            <p className="mt-1 text-sm text-muted">
              Consultez, confirmez et gérez le cycle de vie des commandes clients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loadingOrders}
            >
              <RefreshCw
                size={16}
                className={loadingOrders ? "animate-spin" : ""}
              />
              <span>Actualiser</span>
            </Button>
            <Button to="/boutique" variant="ghost" size="sm">
              <span>Boutique</span>
              <ExternalLink size={14} />
            </Button>
          </div>
        </div>

        {/* Message de rétroaction d'action (Confirmation, annulation, mise à jour) */}
        {actionMessage ? (
          <div
            className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-sm ${
              actionMessage.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-red-300 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <Check size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-muted hover:text-charcoal"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}

        {/* Erreur de récupération des commandes */}
        {fetchError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {fetchError}
          </div>
        ) : null}

        {/* Barre d'outils : Filtres par statut & Recherche */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Onglets de statut */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "ALL", label: "Toutes" },
              { key: "PENDING", label: "En attente" },
              { key: "CONFIRMED", label: "Confirmées" },
              { key: "SHIPPED", label: "Expédiées" },
              { key: "DELIVERED", label: "Livrées" },
              { key: "CANCELLED", label: "Annulées" },
            ].map((tab) => {
              const active = statusFilter === tab.key;
              const count = counts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-forest text-ivory shadow-sm"
                      : "border border-gold/40 bg-ivory text-charcoal hover:bg-cream"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active
                        ? "bg-ivory/20 text-ivory"
                        : "bg-sage/20 text-forest"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recherche */}
          <div className="relative min-w-[260px]">
            <Search
              size={16}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (N°, client, ville, tél)..."
              className="w-full rounded-full border border-gold/60 bg-ivory py-2 pr-4 pl-9 text-sm text-charcoal shadow-inner focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>
        </div>

        {/* Liste des commandes */}
        {loadingOrders && orders.length === 0 ? (
          <div className="mt-12">
            <Loader label="Chargement des commandes..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<Clock size={28} />}
              title="Aucune commande trouvée"
              description={
                searchQuery
                  ? "Aucune commande ne correspond à votre recherche."
                  : statusFilter !== "ALL"
                  ? `Aucune commande avec le statut "${STATUS_CONFIG[statusFilter]?.label || statusFilter}".`
                  : "Aucune commande n'a encore été enregistrée."
              }
            >
              {searchQuery || statusFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSearchQuery("");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              ) : null}
            </EmptyState>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = statusCfg.icon;
              const isExpanded = Boolean(expandedOrders[order.id]);
              const isActionLoading = actionLoadingId === order.id;

              return (
                <article
                  key={order.id}
                  className="rounded-3xl border border-gold/40 bg-ivory p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  {/* Ligne principale : Réf, Date, Statut, Montant */}
                  <div className="flex flex-col justify-between gap-3 border-b border-gold/20 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-heading text-xl font-bold tracking-tight text-forest">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${statusCfg.badgeClass}`}
                        >
                          <StatusIcon size={13} />
                          <span>{statusCfg.label}</span>
                        </span>
                        {order.stockDeducted ? (
                          <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[10px] font-semibold text-forest">
                            Stock déduit
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Passée le {formatDate(order.createdAt)}
                        {order.confirmedAt
                          ? ` • Confirmée le ${formatDate(order.confirmedAt)}`
                          : ""}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="block text-xs text-muted">Montant total</span>
                      <span className="font-heading text-2xl font-bold text-forest">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Détails client & livraison */}
                  <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="block font-semibold text-forest">Client</span>
                      <p className="mt-0.5 font-medium text-charcoal">
                        {order.customerName}
                      </p>
                      <p className="text-muted">{order.customerEmail}</p>
                      <p className="text-muted">{order.customerPhone}</p>
                    </div>

                    <div>
                      <span className="block font-semibold text-forest">
                        Adresse de livraison
                      </span>
                      <p className="mt-0.5 text-charcoal">{order.address}</p>
                      <p className="text-muted">
                        Ville : <strong className="text-charcoal">{order.city}</strong>
                      </p>
                    </div>

                    <div>
                      <span className="block font-semibold text-forest">
                        Détail des frais
                      </span>
                      <p className="mt-0.5 text-muted">
                        Sous-total articles :{" "}
                        <strong className="text-charcoal">
                          {formatPrice(order.subtotal)}
                        </strong>
                      </p>
                      <p className="text-muted">
                        Frais de livraison :{" "}
                        <strong className="text-charcoal">
                          {formatPrice(order.deliveryFee)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Section repliable : Articles commandés */}
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="mt-4 border-t border-gold/20 pt-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest transition hover:text-sage"
                      >
                        <span>
                          {isExpanded
                            ? "Masquer les articles"
                            : `Voir les articles commandés (${order.items.length})`}
                        </span>
                      </button>

                      {isExpanded ? (
                        <div className="mt-3 overflow-x-auto rounded-2xl border border-gold/30 bg-cream/50 p-3">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-gold/30 text-muted">
                                <th className="pb-2 font-medium">Article</th>
                                <th className="pb-2 text-center font-medium">Qté</th>
                                <th className="pb-2 text-right font-medium">
                                  Prix unitaire
                                </th>
                                <th className="pb-2 text-right font-medium">
                                  Total ligne
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                              {order.items.map((item) => (
                                <tr key={item.id || item.productId}>
                                  <td className="py-2 font-medium text-forest">
                                    <Link
                                      to={`/produit/${item.productId}`}
                                      className="hover:underline"
                                    >
                                      {item.productName}
                                    </Link>
                                  </td>
                                  <td className="py-2 text-center text-charcoal">
                                    {item.quantity}
                                  </td>
                                  <td className="py-2 text-right text-muted">
                                    {formatPrice(item.unitPrice)}
                                  </td>
                                  <td className="py-2 text-right font-semibold text-charcoal">
                                    {formatPrice(item.lineTotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Actions d'administration selon le cycle de vie */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gold/20 pt-4">
                    <span className="text-xs text-muted">
                      {isActionLoading
                        ? "Mise à jour en cours..."
                        : `Réf : ${order.id}`}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Action 1 : Confirmation (PENDING -> CONFIRMED, déduit le stock) */}
                      {order.status === "PENDING" ? (
                        <Button
                          size="sm"
                          disabled={isActionLoading}
                          onClick={() => handleConfirm(order)}
                          className="bg-forest text-ivory hover:bg-forest-dark"
                        >
                          <CheckCircle2 size={15} />
                          <span>Confirmer la commande</span>
                        </Button>
                      ) : null}

                      {/* Action 2 : Expédition (CONFIRMED -> SHIPPED) */}
                      {order.status === "CONFIRMED" ? (
                        <Button
                          size="sm"
                          disabled={isActionLoading}
                          onClick={() => handleUpdateStatus(order, "SHIPPED")}
                          className="bg-blue-800 text-ivory hover:bg-blue-900"
                        >
                          <Truck size={15} />
                          <span>Marquer comme expédiée</span>
                        </Button>
                      ) : null}

                      {/* Action 3 : Livraison (SHIPPED -> DELIVERED) */}
                      {order.status === "SHIPPED" ? (
                        <Button
                          size="sm"
                          disabled={isActionLoading}
                          onClick={() => handleUpdateStatus(order, "DELIVERED")}
                          className="bg-emerald-800 text-ivory hover:bg-emerald-900"
                        >
                          <PackageCheck size={15} />
                          <span>Marquer comme livrée</span>
                        </Button>
                      ) : null}

                      {/* Action 4 : Annulation (possible depuis PENDING ou CONFIRMED) */}
                      {order.status === "PENDING" || order.status === "CONFIRMED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isActionLoading}
                          onClick={() => handleCancel(order)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle size={15} />
                          <span>Annuler la commande</span>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PageContainer>
    </section>
  );
}
