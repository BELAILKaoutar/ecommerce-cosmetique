
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

const LOW_STOCK_THRESHOLD = 5;

function getStockStatus(product) {
  if (product.stock === 0) {
    return {
      label: "Rupture de stock",
      className: "bg-red-100 text-red-700",
    };
  }

  if (product.stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Stock faible",
      className: "bg-amber-100 text-amber-800",
    };
  }

  return {
    label: "Disponible",
    className: "bg-green-100 text-green-800",
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStocks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getStocks();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.products)
          ? response.products
          : [];

      setProducts(list);
    } catch (err) {
      setError(err.message || "Impossible de charger les stocks.");
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
  }), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

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
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    if (saving) return;

    setSelectedProduct(null);
    setQuantity("");
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
      setError(
        operation === "restock"
          ? "Saisis une quantité entière supérieure à zéro."
          : "Saisis une quantité entière positive ou nulle."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (operation === "restock") {
        await restockProduct(selectedProduct.id, parsedQuantity);
      } else {
        await adjustProductStock(selectedProduct.id, parsedQuantity);
      }

      const message =
        operation === "restock"
          ? "Stock réapprovisionné avec succès."
          : "Stock ajusté avec succès.";

      const response = await getStocks();
      setProducts(
        Array.isArray(response)
          ? response
          : response?.products ?? []
      );

      setSelectedProduct(null);
      setQuantity("");
      setSuccess(message);
    } catch (err) {
      setError(err.message || "Impossible de modifier le stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* En-tête */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-forest">
            Gestion du stock
          </h1>
          <p className="mt-2 text-charcoal">
            Suivez les quantités et les disponibilités de vos produits.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Statistiques */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total produits",
            value: stats.total,
            icon: Package,
          },
          {
            label: "Stock faible",
            value: stats.low,
            icon: AlertTriangle,
          },
          {
            label: "Rupture de stock",
            value: stats.out,
            icon: Boxes,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-gold/30 bg-ivory p-5"
          >
            <div className="mb-3 flex items-center gap-2 text-sage">
              <Icon size={19} />
              <span className="text-sm">{label}</span>
            </div>

            <p className="text-3xl font-semibold text-forest">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Recherche et filtres */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="search"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/40 bg-ivory py-3 pl-10 pr-4 outline-none focus:border-forest"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-gold/40 bg-ivory px-4 py-3 text-forest"
        >
          <option value="all">Tous les stocks</option>
          <option value="available">Disponibles</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture de stock</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-2xl border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 bg-cream text-forest">
            <tr>
              <th className="px-5 py-4">Produit</th>
              <th className="px-5 py-4">Catégorie</th>
              <th className="px-5 py-4">Quantité</th>
              <th className="px-5 py-4">Statut</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  Chargement des stocks...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  Aucun produit trouvé.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const status = getStockStatus(product);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gold/20 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-contain"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream">
                            <Package size={20} />
                          </div>
                        )}

                        <span className="font-medium text-forest">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {product.category?.name || "—"}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {product.stock}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${status.className}`}>
                        {status.label}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(product, "restock")}
                          className="flex items-center gap-1 rounded-lg bg-forest px-3 py-2 text-xs text-white"
                        >
                          <Plus size={14} />
                          Ajouter
                        </button>

                        <button
                          type="button"
                          onClick={() => openModal(product, "adjust")}
                          className="flex items-center gap-1 rounded-lg border border-gold/50 px-3 py-2 text-xs text-forest"
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

      {/* Modal de gestion du stock */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-modal-title"
            className="w-full max-w-md rounded-3xl bg-ivory p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="stock-modal-title"
                className="font-heading text-2xl text-forest"
              >
                {operation === "restock"
                  ? "Réapprovisionner"
                  : "Ajuster le stock"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-2 font-medium text-forest">
              {selectedProduct.name}
            </p>

            <p className="mb-5 text-sm text-muted">
              Stock actuel : {selectedProduct.stock}
            </p>

            <form onSubmit={handleSubmit}>
              <label
                htmlFor="stock-quantity"
                className="mb-2 block text-sm text-forest"
              >
                {operation === "restock"
                  ? "Quantité à ajouter"
                  : "Nouvelle quantité"}
              </label>

              <input
                id="stock-quantity"
                type="number"
                min={operation === "restock" ? 1 : 0}
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mb-6 w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gold/50 px-5 py-2 text-forest"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-forest px-5 py-2 text-white disabled:opacity-60"
                >
                  {saving ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
