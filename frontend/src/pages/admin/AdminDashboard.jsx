import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  AlertTriangle,
  FolderTree,
  CalendarCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { getDashboardStats } from "../../api/dashboard";
import { formatPrice } from "../../utils/format";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";

const STATUS_BADGES = {
  PENDING: { label: "En attente", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  CONFIRMED: { label: "Confirmée", cls: "bg-forest/15 text-forest border-forest/30" },
  SHIPPED: { label: "Expédiée", cls: "bg-blue-100 text-blue-800 border-blue-300" },
  DELIVERED: { label: "Livrée", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  CANCELLED: { label: "Annulée", cls: "bg-red-100 text-red-800 border-red-300" },
};

const APPOINTMENT_STATUS_BADGES = {
  PENDING: { label: "En attente", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  CONFIRMED: { label: "Confirmée", cls: "bg-forest/15 text-forest border-forest/30" },
  CANCELLED: { label: "Annulée", cls: "bg-red-100 text-red-800 border-red-300" },
  COMPLETED: { label: "Honorée", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(
        err.message || "Impossible de charger les statistiques du tableau de bord."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading && !stats) {
    return (
      <div className="py-20 flex justify-center">
        <Loader label="Chargement des statistiques en temps réel..." />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-xs">
        <AlertTriangle size={36} className="mx-auto text-red-600 mb-3" />
        <h2 className="font-heading text-2xl text-red-900">
          Erreur de connexion
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <div className="mt-6">
          <Button onClick={loadStats}>
            <RefreshCw size={16} />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const {
    orders = {},
    products = {},
    categories = {},
    appointments = {},
    ordersDistribution = [],
    stockDistribution = [],
    recentOrders = [],
    upcomingAppointments = [],
  } = stats || {};

  // Calcul du taux d'exécution des commandes
  const totalCompletedOrders = (orders.confirmed || 0) + (orders.shipped || 0) + (orders.delivered || 0);
  const orderSuccessRate = orders.total > 0 ? Math.round((totalCompletedOrders / orders.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* =========================================
          BANDEAU DE BIENVENUE & ACTIONS RAPIDES
      ========================================= */}
      <div className="rounded-3xl border border-gold/40 bg-gradient-to-r from-forest to-forest-dark p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={16} />
              <span>Tableau de bord interactif</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Bienvenue sur votre espace BY WIJO
            </h2>
            <p className="mt-2 text-sm text-cream/80 max-w-xl leading-relaxed">
              Consultez les performances de vos ventes cosmétiques, les commandes en attente
              et les rendez-vous de soins en temps réel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition backdrop-blur-xs disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Actualiser
            </button>

            <Link
              to="/admin/commandes"
              className="flex items-center gap-2 rounded-2xl bg-gold hover:bg-[#c9b48b] text-charcoal px-4 py-2.5 text-sm font-semibold transition shadow-xs"
            >
              Voir les commandes
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Décoration de fond subtile */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* =========================================
          CARTES STATISTIQUES PRINCIPALES (KPIS)
      ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Chiffre d'Affaires */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs relative overflow-hidden group hover:border-forest/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Chiffre d'affaires
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-heading text-3xl font-bold text-forest">
              {formatPrice(orders.revenue || 0)}
            </p>
            <p className="mt-1 text-xs text-muted flex items-center gap-1">
              <span>Commandes confirmées & livrées</span>
            </p>
          </div>
        </div>

        {/* Commandes en attente */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs relative overflow-hidden group hover:border-amber-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              À traiter d'urgence
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-3xl font-bold text-amber-900">
                {orders.pending || 0}
              </p>
              <span className="text-xs text-amber-700 font-medium">en attente</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              sur {orders.total || 0} commande(s) totale(s)
            </p>
          </div>
        </div>

        {/* Produits au catalogue & Ruptures */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs relative overflow-hidden group hover:border-forest/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Catalogue Produits
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <Package size={22} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-3xl font-bold text-forest">
                {products.total || 0}
              </p>
              <span className="text-xs text-muted">références</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              {products.outOfStock > 0 ? (
                <span className="font-semibold text-red-600 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {products.outOfStock} rupture(s)
                </span>
              ) : (
                <span className="text-forest font-medium">Aucune rupture</span>
              )}
              <span className="text-muted">• {categories.total || 0} catégorie(s)</span>
            </div>
          </div>
        </div>

        {/* Réservations Soins & Hijama */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs relative overflow-hidden group hover:border-forest/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Soins & Hijama
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <CalendarCheck size={22} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-3xl font-bold text-forest">
                {appointments.total || 0}
              </p>
              <span className="text-xs text-muted">réservation(s)</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {appointments.pending || 0} en attente • {appointments.confirmed || 0} confirmée(s)
            </p>
          </div>
        </div>
      </div>

      {/* =========================================
          GRAPHIQUES ET RÉPARTITIONS VISUELLES
      ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des commandes par statut */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading text-xl font-bold text-forest">
                Répartition des commandes
              </h3>
              <p className="text-xs text-muted">
                Statuts des {orders.total || 0} commandes enregistrées
              </p>
            </div>
            <Link
              to="/admin/commandes"
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
            >
              Gérer <ChevronRight size={14} />
            </Link>
          </div>

          {/* Barres de progression / Proportion */}
          <div className="space-y-3.5">
            {ordersDistribution.map((item) => {
              const percent = orders.total > 0 ? Math.round((item.count / orders.total) * 100) : 0;
              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-charcoal flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="text-muted">
                      {item.count} commande(s) ({percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-cream overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gold/30 flex items-center justify-between text-xs text-muted">
            <span>Taux de validation globale :</span>
            <span className="font-semibold text-forest text-sm">{orderSuccessRate}%</span>
          </div>
        </div>

        {/* Santé des stocks de produits */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading text-xl font-bold text-forest">
                Santé de l'inventaire
              </h3>
              <p className="text-xs text-muted">
                Surveillance du stock pour {products.total || 0} référence(s)
              </p>
            </div>
            <Link
              to="/admin/stock"
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
            >
              Inventaire <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {stockDistribution.map((item) => {
              const percent = products.total > 0 ? Math.round((item.count / products.total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-charcoal flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="text-muted">
                      {item.count} produit(s) ({percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-cream overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gold/30 flex items-center justify-between text-xs">
            <span className="text-muted">État global :</span>
            {products.outOfStock > 0 ? (
              <span className="rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 font-semibold text-[11px]">
                {products.outOfStock} produit(s) à réapprovisionner
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-semibold text-[11px]">
                Stock sain et approvisionné
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          TABLEAUX : DERNIÈRES COMMANDES & RÉSERVATIONS
      ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières Commandes */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-forest">
                  Dernières commandes
                </h3>
                <p className="text-xs text-muted">
                  Commandes récemment passées sur la boutique
                </p>
              </div>
              <Link
                to="/admin/commandes"
                className="text-xs font-semibold text-forest hover:underline"
              >
                Tout voir ({orders.total || 0})
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">
                Aucune commande pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-gold/20">
                {recentOrders.map((order) => {
                  const badge = STATUS_BADGES[order.status] || {
                    label: order.status,
                    cls: "bg-cream text-charcoal",
                  };
                  return (
                    <div
                      key={order.id}
                      className="py-3 flex items-center justify-between gap-3 text-sm hover:bg-cream/40 px-2 rounded-xl transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-forest">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="truncate text-xs text-charcoal font-medium mt-0.5">
                          {order.customerName} • {order.city}
                        </p>
                        <p className="text-[11px] text-muted">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-semibold text-forest">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-[11px] text-muted">
                          {order.items?.length || 0} article(s)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gold/30 mt-4">
            <Link
              to="/admin/commandes"
              className="flex items-center justify-center gap-2 rounded-xl border border-gold/60 bg-white py-2.5 text-xs font-semibold text-forest hover:bg-cream transition w-full"
            >
              Gérer toutes les commandes
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Dernières Réservations Soins & Hijama */}
        <div className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-forest">
                  Dernières réservations
                </h3>
                <p className="text-xs text-muted">
                  Séances de soins et Hijama programmées
                </p>
              </div>
              <Link
                to="/admin/reservations"
                className="text-xs font-semibold text-forest hover:underline"
              >
                Tout voir ({appointments.total || 0})
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">
                Aucune réservation enregistrée.
              </div>
            ) : (
              <div className="divide-y divide-gold/20">
                {upcomingAppointments.map((appt) => {
                  const badge = APPOINTMENT_STATUS_BADGES[appt.status] || {
                    label: appt.status,
                    cls: "bg-cream text-charcoal",
                  };
                  const serviceName = appt.slot?.service?.name || "Soin / Hijama";
                  return (
                    <div
                      key={appt.id}
                      className="py-3 flex items-center justify-between gap-3 text-sm hover:bg-cream/40 px-2 rounded-xl transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-forest truncate font-heading">
                            {serviceName}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="truncate text-xs text-charcoal font-medium mt-0.5">
                          {appt.customerName} ({appt.phone})
                        </p>
                        <p className="text-[11px] text-muted">
                          Créneau : {formatDate(appt.slot?.startAt)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-forest font-semibold">
                          {appt.slot?.service?.price ? formatPrice(appt.slot.service.price) : "Sur devis"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gold/30 mt-4">
            <Link
              to="/admin/reservations"
              className="flex items-center justify-center gap-2 rounded-xl border border-gold/60 bg-white py-2.5 text-xs font-semibold text-forest hover:bg-cream transition w-full"
            >
              Gérer les réservations
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
