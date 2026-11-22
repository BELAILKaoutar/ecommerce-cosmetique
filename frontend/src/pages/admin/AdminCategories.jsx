import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  FolderTree,
  Package,
  Search,
  Eye,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import { formatPrice } from "../../utils/format";
import { getImageUrl } from "../../utils/imageUrl";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import ToastNotification from "../../components/admin/ToastNotification";

const EMPTY_FORM = { name: "", description: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Modale des produits associés
  const [viewingCategory, setViewingCategory] = useState(null);

  // Modale de confirmation de suppression
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    category: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({
        type: "error",
        title: "Erreur de chargement",
        message: err.message || "Impossible de charger les catégories.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Le nom de la catégorie est obligatoire.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };

      if (editingId) {
        await updateCategory(editingId, payload);
        setToast({
          type: "success",
          title: "Catégorie modifiée",
          message: `La catégorie "${payload.name}" a été mise à jour.`,
        });
      } else {
        await createCategory(payload);
        setToast({
          type: "success",
          title: "Catégorie créée",
          message: `La catégorie "${payload.name}" a été ajoutée.`,
        });
      }

      closeForm();
      await loadCategories();
    } catch (err) {
      setFormError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (category) => {
    setDeleteModalConfig({
      isOpen: true,
      category,
    });
  };

  const handleDeleteConfirm = async () => {
    const category = deleteModalConfig.category;
    if (!category) return;

    setDeleteLoading(true);
    try {
      await deleteCategory(category.id);
      setToast({
        type: "success",
        title: "Catégorie supprimée",
        message: `La catégorie "${category.name}" a été supprimée.`,
      });
      setDeleteModalConfig({ isOpen: false, category: null });
      await loadCategories();
    } catch (err) {
      setToast({
        type: "error",
        title: "Suppression impossible",
        message:
          err.message ||
          "Cette catégorie contient des produits et ne peut pas être supprimée.",
      });
      setDeleteModalConfig({ isOpen: false, category: null });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/40 pb-5">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-forest">
            Catégories de Cosmétiques
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">
            Organisez et structurez les gammes de produits de votre boutique.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadCategories}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-2xl border border-gold/60 bg-ivory px-3.5 py-2 text-xs md:text-sm font-semibold text-forest hover:bg-cream transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>

          <Button onClick={openCreate} size="sm">
            <Plus size={16} />
            Ajouter une catégorie
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center justify-between gap-4 bg-ivory p-4 rounded-3xl border border-gold/40 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie..."
            className="w-full rounded-2xl border border-gold/50 bg-cream py-2 pl-9 pr-4 text-xs md:text-sm outline-none focus:border-forest transition"
          />
        </div>

        <span className="text-xs text-muted shrink-0 hidden sm:inline">
          {categories.length} catégorie(s) enregistrée(s)
        </span>
      </div>

      {/* Formulaire Modal de Création / Modification */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-gold/40 bg-ivory p-6 md:p-8 shadow-xl animate-scaleIn space-y-5">
            <div className="flex items-center justify-between border-b border-gold/30 pb-4">
              <h3 className="font-heading text-2xl font-bold text-forest">
                {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="text-muted hover:text-charcoal p-1 rounded-lg hover:bg-cream"
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
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest uppercase tracking-wider">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ex. Soins du Visage, Huiles Précieuses..."
                  className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Présentation des cosmétiques de cette catégorie..."
                  className="w-full rounded-2xl border border-gold/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest transition"
                />
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
                  {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des catégories en cartes modernes */}
      {loading && categories.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader label="Chargement des catégories..." />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-3xl border border-gold/40 bg-ivory p-12 text-center shadow-xs">
          <FolderTree size={40} className="mx-auto text-muted/60 mb-3" />
          <h3 className="font-heading text-xl text-forest">
            Aucune catégorie trouvée
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            {search
              ? "Aucune catégorie ne correspond à votre recherche."
              : "Créez votre première catégorie pour organiser votre catalogue cosmétique."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const productCount =
              category._count?.products ?? (category.products?.length || 0);

            return (
              <article
                key={category.id}
                className="flex flex-col justify-between rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs transition hover:border-forest/50 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-heading text-xl font-bold text-forest">
                      {category.name}
                    </h3>
                    <span className="flex items-center gap-1 rounded-full border border-forest/20 bg-forest/10 px-2.5 py-0.5 text-xs font-semibold text-forest shrink-0">
                      <Package size={13} />
                      {productCount} produit(s)
                    </span>
                  </div>

                  <p className="text-xs text-muted leading-relaxed line-clamp-3">
                    {category.description || "Aucune description renseignée."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gold/30 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingCategory(category)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
                  >
                    <Eye size={14} />
                    Produits ({productCount})
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="p-1.5 rounded-xl border border-gold/40 text-charcoal hover:bg-cream transition"
                      title="Modifier"
                      aria-label={`Modifier ${category.name}`}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => requestDelete(category)}
                      className="p-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition"
                      title="Supprimer"
                      aria-label={`Supprimer ${category.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* =========================================
          MODALE DES PRODUITS ASSOCIÉS
      ========================================= */}
      {viewingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-gold/40 bg-ivory p-6 md:p-8 shadow-xl animate-scaleIn space-y-5">
            <div className="flex items-start justify-between border-b border-gold/30 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Produits associés à la catégorie
                </span>
                <h3 className="font-heading text-2xl font-bold text-forest mt-0.5">
                  {viewingCategory.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingCategory(null)}
                className="text-muted hover:text-charcoal p-1.5 rounded-lg hover:bg-cream"
              >
                ✕
              </button>
            </div>

            {(!viewingCategory.products || viewingCategory.products.length === 0) ? (
              <div className="py-8 text-center text-sm text-muted">
                Aucun produit n'est actuellement rattaché à cette catégorie.
              </div>
            ) : (
              <div className="divide-y divide-gold/15 bg-white rounded-2xl border border-gold/30 overflow-hidden">
                {viewingCategory.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs md:text-sm hover:bg-cream/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {prod.imageUrl ? (
                        <img
                          src={getImageUrl(prod.imageUrl)}
                          alt={prod.name}
                          className="h-10 w-10 rounded-xl object-cover border border-gold/30 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-cream flex items-center justify-center text-forest border border-gold/30 shrink-0">
                          <Package size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-charcoal truncate">
                          {prod.name}
                        </p>
                        <p className="text-xs text-muted">
                          Stock : <strong>{prod.stock}</strong> unité(s)
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-heading font-bold text-forest text-base">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-gold/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingCategory(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de Confirmation de suppression */}
      <ConfirmationModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, category: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteModalConfig.category?.name}" ?\nCette action est irréversible.`}
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
