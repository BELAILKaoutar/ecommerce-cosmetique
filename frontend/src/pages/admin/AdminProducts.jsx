import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  X,
  Package,
  Eye,
  AlertTriangle,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/products";
import { getCategories } from "../../api/categories";
import { uploadProductImage } from "../../api/uploads";
import { formatPrice } from "../../utils/format";
import { getImageUrl } from "../../utils/imageUrl";

import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import ToastNotification from "../../components/admin/ToastNotification";

const EMPTY_FORM = {
  name: "",
  description: "",
  usageAdvice: "",
  price: "",
  stock: "0",
  imageUrl: "",
  isActive: true,
  categoryId: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulaire d'ajout / modification
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Modale de détails
  const [viewingProduct, setViewingProduct] = useState(null);

  // Modale de suppression
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    product: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtres et recherche
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");

  // Notifications
  const [toast, setToast] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      setToast({
        type: "error",
        title: "Erreur de chargement",
        message: err.message || "Impossible de charger les données du catalogue.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || "",
    });
    setSelectedImage(null);
    setImagePreview("");
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      usageAdvice: product.usageAdvice || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      imageUrl: product.imageUrl || "",
      isActive: product.isActive ?? true,
      categoryId: product.categoryId || categories[0]?.id || "",
    });
    setSelectedImage(null);
    setImagePreview(product.imageUrl ? getImageUrl(product.imageUrl) : "");
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setSelectedImage(null);
    setImagePreview("");
    setFormError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Veuillez sélectionner un fichier image valide.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("La taille de l'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Le nom du produit est obligatoire.");
      return;
    }

    const price = Number(form.price);
    if (isNaN(price) || price <= 0) {
      setFormError("Le prix doit être un nombre supérieur à 0.");
      return;
    }

    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Le stock doit être un entier positif ou nul.");
      return;
    }

    if (!form.categoryId) {
      setFormError("Veuillez sélectionner une catégorie.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      let imageUrl = form.imageUrl || null;

      if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage);
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        usageAdvice: form.usageAdvice.trim() || null,
        price,
        stock,
        imageUrl,
        isActive: form.isActive,
        categoryId: form.categoryId,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        setToast({
          type: "success",
          title: "Produit mis à jour",
          message: `Le produit "${payload.name}" a été modifié.`,
        });
      } else {
        await createProduct(payload);
        setToast({
          type: "success",
          title: "Produit créé",
          message: `Le produit "${payload.name}" a été ajouté au catalogue.`,
        });
      }

      closeForm();
      await loadData();
    } catch (err) {
      setFormError(err.message || "Impossible d'enregistrer le produit.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (product) => {
    setDeleteModalConfig({
      isOpen: true,
      product,
    });
  };

  const handleDeleteConfirm = async () => {
    const product = deleteModalConfig.product;
    if (!product) return;

    setDeleteLoading(true);
    try {
      await deleteProduct(product.id);
      setToast({
        type: "success",
        title: "Produit supprimé",
        message: `Le produit "${product.name}" a été retiré.`,
      });
      setDeleteModalConfig({ isOpen: false, product: null });
      await loadData();
    } catch (err) {
      setToast({
        type: "error",
        title: "Suppression impossible",
        message: err.message || "Erreur lors de la suppression.",
      });
      setDeleteModalConfig({ isOpen: false, product: null });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase().trim()));

      const matchesCategory =
        !categoryFilter || p.categoryId === categoryFilter;

      let matchesStock = true;
      if (stockFilter === "OUT") matchesStock = p.stock === 0;
      if (stockFilter === "LOW") matchesStock = p.stock > 0 && p.stock <= 5;
      if (stockFilter === "IN") matchesStock = p.stock > 5;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/40 pb-5">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest">
            Catalogue Produits
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">
            Gérez vos cosmétiques, tarifs, descriptions et conseils d'utilisation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-2xl border border-gold/60 bg-ivory px-3.5 py-2 text-xs md:text-sm font-semibold text-forest hover:bg-cream transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>

          <Button onClick={openCreate} size="sm">
            <Plus size={16} />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-ivory p-4 rounded-3xl border border-gold/40 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-2xl border border-gold/50 bg-cream py-2 pl-9 pr-4 text-xs md:text-sm outline-none focus:border-forest transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-gold/50 bg-cream px-3 py-2 text-xs md:text-sm outline-none focus:border-forest text-charcoal transition"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-2xl border border-gold/50 bg-cream px-3 py-2 text-xs md:text-sm outline-none focus:border-forest text-charcoal transition"
          >
            <option value="ALL">Tous les stocks</option>
            <option value="IN">En stock (&gt; 5)</option>
            <option value="LOW">Stock faible (1 à 5)</option>
            <option value="OUT">Rupture de stock (0)</option>
          </select>
        </div>

        <span className="text-xs text-muted shrink-0 text-right">
          {filteredProducts.length} produit(s) affiché(s)
        </span>
      </div>

      {/* Liste des produits sous forme de tableau / cartes */}
      {loading && products.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader label="Chargement du catalogue..." />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-gold/40 bg-ivory p-12 text-center shadow-xs">
          <Package size={40} className="mx-auto text-muted/60 mb-3" />
          <h3 className="font-heading text-xl text-forest">
            Aucun produit trouvé
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            {search || categoryFilter || stockFilter !== "ALL"
              ? "Aucun produit ne correspond à vos critères de recherche."
              : "Commencez par ajouter votre premier produit cosmétique."}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-gold/40 bg-ivory shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gold/30 bg-cream/60 text-muted uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Produit</th>
                  <th className="py-3.5 px-4 font-semibold">Catégorie</th>
                  <th className="py-3.5 px-4 font-semibold">Prix</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Visibilité</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/20">
                {filteredProducts.map((product) => {
                  const catName = categoryNames.get(product.categoryId) || "—";
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-cream/40 transition group"
                    >
                      {/* Image & Nom */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="h-11 w-11 rounded-xl object-cover border border-gold/30 shrink-0"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-xl bg-cream flex items-center justify-center text-forest border border-gold/30 shrink-0">
                              <Package size={20} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="font-semibold text-charcoal block truncate max-w-xs md:max-w-md">
                              {product.name}
                            </span>
                            {product.usageAdvice && (
                              <span className="text-[11px] text-muted truncate block max-w-xs md:max-w-md">
                                Conseil : {product.usageAdvice}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-full bg-cream border border-gold/40 px-2.5 py-0.5 text-xs font-medium text-forest">
                          {catName}
                        </span>
                      </td>

                      {/* Prix */}
                      <td className="py-3.5 px-4 font-heading text-base font-bold text-forest">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-semibold">
                            <AlertTriangle size={12} />
                            Rupture (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-semibold">
                            Faible ({product.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-semibold">
                            {product.stock} en stock
                          </span>
                        )}
                      </td>

                      {/* Visibilité */}
                      <td className="py-3.5 px-4">
                        {product.isActive ? (
                          <span className="text-emerald-700 font-medium text-xs">
                            ● Actif
                          </span>
                        ) : (
                          <span className="text-muted font-medium text-xs">
                            ○ Masqué
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingProduct(product)}
                            className="p-1.5 rounded-lg border border-gold/40 hover:bg-cream text-charcoal transition"
                            title="Détails"
                            aria-label={`Détails de ${product.name}`}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg border border-gold/40 hover:bg-cream text-charcoal transition"
                            title="Modifier"
                            aria-label={`Modifier ${product.name}`}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDelete(product)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition"
                            title="Supprimer"
                            aria-label={`Supprimer ${product.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
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
          MODALE D'AJOUT / MODIFICATION PRODUIT
      ========================================= */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gold/40 bg-ivory p-6 md:p-8 shadow-xl animate-scaleIn space-y-5">
            <div className="flex items-center justify-between border-b border-gold/30 pb-4">
              <h3 className="font-heading text-2xl font-bold text-forest">
                {editingId ? "Modifier le produit cosmétique" : "Ajouter un cosmétique"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-cream"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-forest uppercase tracking-wider">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex. Huile d'Argan Bio Pure, Crème Hydratante..."
                    className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-forest uppercase tracking-wider">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest text-charcoal"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prix */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-forest uppercase tracking-wider">
                    Prix (DH) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Ex. 180"
                    className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest"
                  />
                </div>

                {/* Stock initial */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-forest uppercase tracking-wider">
                    Quantité en stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="Ex. 25"
                    className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest"
                  />
                </div>

                {/* Image du produit */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-forest uppercase tracking-wider">
                    Image du produit
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-xs text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-forest/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-forest hover:file:bg-forest/20"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="h-10 w-10 rounded-xl object-cover border border-gold/40 shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-forest uppercase tracking-wider">
                    Description détaillée
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Bienfaits, formule naturelle, contenance..."
                    className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest"
                  />
                </div>

                {/* Conseils d'utilisation */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-forest uppercase tracking-wider">
                    Conseils d'utilisation
                  </label>
                  <textarea
                    rows={2}
                    value={form.usageAdvice}
                    onChange={(e) => setForm({ ...form, usageAdvice: e.target.value })}
                    placeholder="Appliquer matin et soir sur peau propre et sèche..."
                    className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest"
                  />
                </div>

                {/* Actif */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2.5 text-sm font-medium text-forest cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 rounded accent-forest cursor-pointer"
                    />
                    Produit visible et disponible à l'achat sur la boutique
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Ajouter le produit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODALE DE DÉTAIL D'UN PRODUIT
      ========================================= */}
      {viewingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-gold/40 bg-ivory p-6 md:p-8 shadow-xl animate-scaleIn space-y-5">
            <div className="flex items-start justify-between border-b border-gold/30 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Fiche produit
                </span>
                <h3 className="font-heading text-2xl font-bold text-forest mt-0.5">
                  {viewingProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-cream"
              >
                ✕
              </button>
            </div>

            {viewingProduct.imageUrl && (
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-gold/40">
                <img
                  src={getImageUrl(viewingProduct.imageUrl)}
                  alt={viewingProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-3">
                <span className="text-muted block text-xs mb-1">Catégorie</span>
                <span className="font-semibold text-charcoal">
                  {categoryNames.get(viewingProduct.categoryId) || "Non classé"}
                </span>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-3">
                <span className="text-muted block text-xs mb-1">Prix TTC</span>
                <span className="font-heading text-lg font-bold text-forest">
                  {formatPrice(viewingProduct.price)}
                </span>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-3">
                <span className="text-muted block text-xs mb-1">Stock disponible</span>
                <span className="font-bold text-charcoal">
                  {viewingProduct.stock} unité(s)
                </span>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-cream/40 p-3">
                <span className="text-muted block text-xs mb-1">Visibilité</span>
                <span className="font-semibold text-forest">
                  {viewingProduct.isActive ? "En ligne" : "Masqué"}
                </span>
              </div>

              {viewingProduct.description && (
                <div className="col-span-2 rounded-2xl border border-gold/30 bg-cream/40 p-3.5">
                  <span className="text-muted block text-xs mb-1 font-semibold">
                    Description
                  </span>
                  <p className="text-xs text-charcoal/90 leading-relaxed whitespace-pre-line">
                    {viewingProduct.description}
                  </p>
                </div>
              )}

              {viewingProduct.usageAdvice && (
                <div className="col-span-2 rounded-2xl border border-gold/30 bg-cream/40 p-3.5">
                  <span className="text-muted block text-xs mb-1 font-semibold">
                    Conseils d'utilisation
                  </span>
                  <p className="text-xs text-charcoal/90 leading-relaxed whitespace-pre-line">
                    {viewingProduct.usageAdvice}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gold/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingProduct(null)}
              >
                Fermer
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const p = viewingProduct;
                  setViewingProduct(null);
                  openEdit(p);
                }}
              >
                Modifier le produit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de Confirmation de suppression */}
      <ConfirmationModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, product: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteModalConfig.product?.name}" ?\nCette opération retirera le produit du catalogue.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Notifications Toast */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
