
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, X } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import PageContainer from "../../components/ui/PageContainer";

const EMPTY_FORM = { name: "", description: "" };

export default function AdminCategories() {
  const { isAuthenticated, loading: authLoading, error: authError, retryAuth } =
    useAdminAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Impossible de charger les catégories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated, loadCategories]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Le nom de la catégorie est obligatoire.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (editingId) {
        await updateCategory(editingId, payload);
        setSuccess("Catégorie modifiée avec succès.");
      } else {
        await createCategory(payload);
        setSuccess("Catégorie ajoutée avec succès.");
      }

      closeForm();
      await loadCategories();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteCategory(category.id);
      setSuccess("Catégorie supprimée avec succès.");
      await loadCategories();
    } catch (err) {
      setError(
        err.message ||
          "Suppression impossible. Vérifiez si cette catégorie contient des produits."
      );
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
        <PageContainer>
          <div className="mx-auto max-w-lg rounded-3xl border border-gold/40 bg-ivory p-8 text-center">
            <h1 className="font-heading text-2xl text-forest">
              Accès administrateur requis
            </h1>
            <p className="mt-3 text-sm text-muted">
              {authError || "Connectez-vous pour gérer les catégories."}
            </p>
            <div className="mt-5">
              <Button onClick={retryAuth}>Réessayer</Button>
            </div>
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
              Gestion des catégories
            </h1>
            <p className="mt-2 text-sm text-muted">
              Ajoutez, modifiez et organisez les catégories de votre boutique.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={openCreate}>
              <Plus size={17} />
              Ajouter
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
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-2xl text-forest">
                {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-forest">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                  placeholder="Ex. Soins du visage"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-forest">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
                  placeholder="Description de la catégorie..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
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

        {loading ? (
          <div className="mt-10">
            <Loader label="Chargement des catégories..." />
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-gold/40 bg-ivory p-10 text-center text-muted">
            Aucune catégorie enregistrée.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className="rounded-3xl border border-gold/40 bg-ivory p-6 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-heading text-xl text-forest">
                  {category.name}
                </h3>

                <p className="mt-3 min-h-12 text-sm text-muted">
                  {category.description || "Aucune description."}
                </p>

                <div className="mt-6 flex gap-3 border-t border-gold/30 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(category)}
                  >
                    <Pencil size={15} />
                    Modifier
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category)}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Supprimer
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </PageContainer>
    </section>
  );
}
