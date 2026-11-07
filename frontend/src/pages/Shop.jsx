
import { useEffect, useState } from "react";

import { categoryApi } from "../api/categoryApi";
import CategoryFilter from "../components/categories/CategoryFilter";
import ProductCard from "../components/products/ProductCard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Shop() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // 1. Charger les catégories depuis le backend
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const data = await categoryApi.getAll();

        if (!cancelled) {
          setCategories(data);
        }
      } catch (err) {
        if (!cancelled) {
          setCategoryError(err.message);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Charger les produits selon la catégorie choisie
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");
      setProducts([]);

      try {
        const params = new URLSearchParams({
          available: "true",
        });

        if (selectedCategory) {
          params.set("categoryId", selectedCategory);
        }

        const url = `${API_URL}/products?${params.toString()}`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Impossible de charger les produits");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setProducts(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [selectedCategory]);

  // 3. Affichage de la boutique
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      {/* Titre */}
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl text-forest">
          Nos produits naturels
        </h1>

        <p className="mt-3 text-charcoal">
          Découvrez notre collection de produits cosmétiques.
        </p>
      </div>

      {/* Catégories */}
      <section className="mb-10">
        <h2 className="mb-5 font-heading text-2xl text-forest">
          Catégories
        </h2>

        {categoriesLoading ? (
          <p>Chargement des catégories...</p>
        ) : categoryError ? (
          <p role="alert" className="text-red-600">
            {categoryError}
          </p>
        ) : (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}
      </section>

      {/* Produits */}
      <section>
        <h2 className="mb-6 font-heading text-2xl text-forest">
          Nos produits
        </h2>

        {loading && (
          <p>Chargement des produits...</p>
        )}

        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-charcoal">
            Aucun produit disponible dans cette catégorie.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
