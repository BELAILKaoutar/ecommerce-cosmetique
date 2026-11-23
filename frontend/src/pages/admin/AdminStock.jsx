import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  Boxes,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  getStocks,
  restockProduct,
  adjustProductStock,
} from "../../api/stock";

import { getImageUrl } from "../../utils/imageUrl";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import ToastNotification from "../../components/admin/ToastNotification";

const LOW_STOCK_THRESHOLD = 5;

function getStockStatus(product) {
  if (product.stock === 0) {
    return {
      label: "Rupture de stock",
      className: "bg-red-100 text-red-800 border-red-200",
    };
  }

  if (product.stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Stock faible",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }

  return {
    label: "Disponible",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
}

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [operation, setOperation] = useState("restock");
  const [quantity, setQuantity] = useState("");
  const [modalError, setModalError] = useState("");

  const [toast, setToast] = useState(null);

  const loadStocks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getStocks();
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.products)
          ? response.products
          : [];

      setProducts(list);
    } catch (err) {
      setToast({
        type: "error",
        title: "Erreur de chargement",
        message: err.message || "Impossible de charger les stocks.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  const stats = useMemo(() => ({
    total: products.length,
    low: products.filter(
      (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
    ).length,
    out: products.filter((p) => p.stock === 0).length,
    inStock: products.filter((p) => p.stock > LOW_STOCK_THRESHOLD).length,
  }), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesFilter =
        filter === "all" ||
        (filter === "low" &&
          product.stock > 0 &&
          product.stock <= LOW_STOCK_THRESHOLD) ||
        (filter === "out" && product.stock === 0) ||
        (filter === "available" &&
          product.stock > LOW_STOCK_THRESHOLD);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const openModal = (product, type) => {
    setSelectedProduct(product);
    setOperation(type);
    setQuantity(type === "adjust" ? String(product.stock) : "");
    setModalError("");
  };

  const closeModal = () => {
    if (saving) return;
    setSelectedProduct(null);
    setQuantity("");
    setModalError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProduct) return;

    const parsedQuantity = Number(quantity);

    if (
      quantity.trim() === "" ||
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity < (operation === "restock" ? 1 : 0)
    ) {
      setModalError(
        operation === "restock"
          ? "Saisissez une quantité entière supérieure à zéro."
          : "Saisissez une quantité entière positive ou nulle."
      );
      return;
    }

    setSaving(true);
    setModalError("");

    try {
      if (operation === "restock") {
        await restockProduct(selectedProduct.id, parsedQuantity);
      } else {
        await adjustProductStock(selectedProduct.id, parsedQuantity);
      }

      const msg =
        operation === "restock"
          ? `Le produit "${selectedProduct.name}" a été réapprovisionné de +${parsedQuantity} unités.`
          : `Le stock du produit "${selectedProduct.name}" est désormais ajusté à ${parsedQuantity} unités.`;

      setToast({
        type: "success",
        title: "Stock actualisé",
        message: msg,
      });

      closeModal();
      await loadStocks();
    } catch (err) {
      setModalError(err.message || "Impossible de modifier le stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/40 pb-5">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest">
            Gestion des stocks & Inventaire
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">
            Contrôlez les niveaux de stock, les réapprovisionnements et évitez les ruptures.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStocks}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-2xl border border-gold/60 bg-ivory px-3.5 py-2 text-xs md:text-sm font-semibold text-forest hover:bg-cream transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Cartes KPI Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-gold/40 bg-ivory p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Références
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <Package size={20} />
            </div>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-forest">
            {stats.total}
          </p>
          <p className="text-xs text-muted mt-1">
            {stats.inStock} produit(s) en quantité suffisante
          </p>
        </div>

        <div className="rounded-3xl border border-gold/40 bg-ivory p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Stock Faible
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-amber-900">
            {stats.low}
          </p>
          <p className="text-xs text-muted mt-1">
            1 à {LOW_STOCK_THRESHOLD} unités restantes
          </p>
        </div>

        <div className="rounded-3xl border border-gold/40 bg-ivory p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Rupture Complète
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-800">
              <Boxes size={20} />
            </div>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold text-red-700">
            {stats.out}
          </p>
          <p className="text-xs text-muted mt-1">
            Produits indisponibles à l'achat
          </p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-ivory p-4 rounded-3xl border border-gold/40 shadow-xs">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gold/50 bg-cream py-2 pl-9 pr-4 text-xs md:text-sm outline-none focus:border-forest transition"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-2xl border border-gold/50 bg-cream px-3 py-2 text-xs md:text-sm outline-none focus:border-forest text-charcoal transition"
        >
          <option value="all">Tous les statuts de stock</option>
          <option value="available">Disponibles (&gt; 5)</option>
          <option value="low">Stock faible (1 à 5)</option>
          <option value="out">Rupture de stock (0)</option>
        </select>
      </div>

      {/* Tableau des stocks */}
      <div className="rounded-3xl border border-gold/40 bg-ivory shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gold/30 bg-cream/60 text-muted uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Produit</th>
                <th className="py-3.5 px-4 font-semibold">Catégorie</th>
                <th className="py-3.5 px-4 font-semibold">Stock Actuel</th>
                <th className="py-3.5 px-4 font-semibold">Statut</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/20">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader label="Chargement des stocks..." />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted">
                    Aucun produit ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-cream/40 transition group"
                    >
                      {/* Image et Nom */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="h-10 w-10 rounded-xl object-cover border border-gold/30 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-cream flex items-center justify-center text-forest border border-gold/30 shrink-0">
                              <Package size={18} />
                            </div>
                          )}

                          <span className="font-semibold text-charcoal">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="py-3.5 px-4 text-muted">
                        {product.category?.name || "—"}
                      </td>

                      {/* Quantité */}
                      <td className="py-3.5 px-4 font-heading text-lg font-bold text-forest">
                        {product.stock}
                      </td>

                      {/* Statut badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Boutons d'action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openModal(product, "restock")}
                            className="flex items-center gap-1 rounded-xl bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-dark transition"
                          >
                            <Plus size={14} />
                            Réapprovisionner
                          </button>

                          <button
                            type="button"
                            onClick={() => openModal(product, "adjust")}
                            className="flex items-center gap-1 rounded-xl border border-gold/60 bg-white px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream transition"
                          >
                            <ArrowDownUp size={14} />
                            Ajuster
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODALE DE RÉAPPROVISIONNEMENT / AJUSTEMENT
      ========================================= */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-gold/40 bg-ivory p-6 md:p-8 shadow-xl animate-scaleIn space-y-5">
            <div className="flex items-center justify-between border-b border-gold/30 pb-4">
              <h3 className="font-heading text-2xl font-bold text-forest">
                {operation === "restock"
                  ? "Réapprovisionner"
                  : "Ajuster l'inventaire"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-muted hover:text-charcoal p-1 rounded-lg hover:bg-cream"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-cream/40 p-3.5">
              <p className="font-semibold text-charcoal text-sm">
                {selectedProduct.name}
              </p>
              <p className="text-xs text-muted mt-0.5">
                Niveau actuel en stock : <strong>{selectedProduct.stock}</strong> unité(s)
              </p>
            </div>

            {modalError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest uppercase tracking-wider">
                  {operation === "restock"
                    ? "Quantité à ajouter au stock (+)"
                    : "Nouvelle quantité totale en stock"}
                </label>
                <input
                  type="number"
                  min={operation === "restock" ? 1 : 0}
                  step="1"
                  required
                  autoFocus
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={operation === "restock" ? "Ex. 10" : "Ex. 25"}
                  className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gold/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Enregistrement..." : "Valider"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Toast */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
