
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  X,
  Package,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/products";
import { getCategories } from "../../api/categories";
import { useAdminAuth } from "../../context/AdminAuthContext";

import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import PageContainer from "../../components/ui/PageContainer";
import { uploadProductImage } from "../../api/uploads";
import { getImageUrl } from "../../utils/imageUrl";

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
  const {
    isAuthenticated,
    loading: authLoading,
    error: authError,
    retryAuth,
  } = useAdminAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(
        Array.isArray(productsData) ? productsData : []
      );
      setCategories(
        Array.isArray(categoriesData) ? categoriesData : []
      );
    } catch (err) {
      setError(err.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesCategory =
        !categoryFilter || product.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
    setSelectedImage(null);
    setImagePreview("");
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
      categoryId: product.categoryId || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
    setSelectedImage(null);
    setImagePreview(product.imageUrl || "");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setError("Le nom du produit est obligatoire.");
      return;
    }

    if (!form.categoryId) {
      setError("Veuillez sélectionner une catégorie.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    if (
      form.stock.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Le stock doit être un entier positif ou zéro.");
      return;
    }


    setSaving(true);
    setError("");
    setSuccess("");

    try {
    let imageUrl = form.imageUrl || null;

    // Si l'admin sélectionne une nouvelle image,
    // elle est envoyée au backend.
    if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage);
    }

    const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        usageAdvice: form.usageAdvice.trim(),
        price,
        stock,
        imageUrl,
        isActive: form.isActive,
        categoryId: form.categoryId,
    };

    if (editingId) {
        await updateProduct(editingId, payload);
        setSuccess("Produit modifié avec succès.");
    } else {
        await createProduct(payload);
        setSuccess("Produit ajouté avec succès.");
    }

    closeForm();
    await loadData();
    } catch (err) {
    setError(err.message || "Impossible d'enregistrer le produit.");
    } finally {
    setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${product.name}" ?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setError("");
    setSuccess("");

    try {
      await deleteProduct(product.id);
      setSuccess("Produit supprimé avec succès.");
      await loadData();
    } catch (err) {
      setError(err.message || "Impossible de supprimer le produit.");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <section className="py-20">
        <PageContainer>
          <Loader label="Vérification de l'accès administrateur..." />
        </PageContainer>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="py-20">
        <PageContainer className="max-w-xl text-center">
          <h1 className="font-heading text-3xl text-forest">
            Accès administrateur requis
          </h1>
          <p className="mt-4 text-muted">
            {authError || "Vous devez vous connecter."}
          </p>
          <div className="mt-6">
            <Button onClick={retryAuth}>Réessayer</Button>
          </div>
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/40 pb-6">
          <div>
            <h1 className="font-heading text-3xl text-forest sm:text-4xl">
              Gestion des produits
            </h1>
            <p className="mt-2 text-sm text-muted">
              Gérez les produits, les prix et le stock de votre boutique.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <Button onClick={openCreate}>
              <Plus size={17} />
              Ajouter un produit
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800">
            {success}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-3xl border border-gold/40 bg-ivory p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl text-forest">
                {editingId ? "Modifier le produit" : "Nouveau produit"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-forest">
                  Nom du produit *
                </label>
                <input
                  required
                  type="text"
                  maxLength={200}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                  placeholder="Ex. Crème hydratante"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-forest">
                  Catégorie *
                </label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) =>
                    updateField("categoryId", e.target.value)
                  }
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-forest">
                  Prix (DH) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                  placeholder="149.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-forest">
                  Quantité en stock *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                />
              </div>
              <div>
              <label className="mb-2 block text-sm font-medium text-forest">
                Image du produit
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gold/50 bg-cream px-4 py-3">
                <label
                  htmlFor="product-image"
                  className="cursor-pointer rounded-lg bg-forest px-4 py-2 text-sm text-white"
                >
                  Choisir l'image
                </label>

                <span className="text-sm text-charcoal">
                  {selectedImage ? selectedImage.name : "Aucune image choisie"}
                </span>

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 5 * 1024 * 1024) {
                      setError("L'image ne doit pas dépasser 5 Mo.");
                      return;
                    }

                    setSelectedImage(file);
                    setImagePreview(URL.createObjectURL(file));
                    setError("");
                  }}
                />
              </div>

                {imagePreview && (
                    <div className="mt-4">
                    <p className="mb-2 text-sm text-muted">
                        Aperçu de l'image
                    </p>

                    <img
                    src={getImageUrl(imagePreview)}
                    alt="Aperçu du produit"
                    className="h-36 w-36 rounded-xl object-cover"
                    />
                    </div>
                )}
                </div>



              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-forest">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-forest">
                  Conseils d'utilisation
                </label>
                <textarea
                  rows={3}
                  value={form.usageAdvice}
                  onChange={(e) =>
                    updateField("usageAdvice", e.target.value)
                  }
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 text-sm font-medium text-forest">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      updateField("isActive", e.target.checked)
                    }
                    className="h-4 w-4 accent-forest"
                  />
                  Produit actif (visible dans la boutique)
                </label>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-xl border border-gold/50 bg-ivory py-3 pl-10 pr-4 outline-none focus:border-forest"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gold/50 bg-ivory px-4 py-3 outline-none focus:border-forest"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="mt-10">
            <Loader label="Chargement des produits..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-gold/40 bg-ivory p-10 text-center">
            <Package size={35} className="mx-auto text-forest" />
            <p className="mt-4 text-muted">
              Aucun produit trouvé.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-gold/40 bg-ivory shadow-sm transition hover:shadow-md"
              >
                <div className="h-48 bg-cream">
                  {product.imageUrl ? (
                    <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    />

                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package size={40} className="text-sage" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-sage/20 px-3 py-1 text-xs text-forest">
                      {categoryNames.get(product.categoryId) ||
                        "Sans catégorie"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl text-forest">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-lg font-semibold text-forest">
                    {Number(product.price).toFixed(2)} DH
                  </p>

                  <p className="mt-1 text-sm text-muted">
                    Stock : {product.stock}
                  </p>

                  <div className="mt-5 flex gap-2 border-t border-gold/30 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(product)}
                    >
                      <Pencil size={15} />
                      Modifier
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </PageContainer>
    </section>
  );
}
