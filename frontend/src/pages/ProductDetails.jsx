
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";

import { getProductById } from "../api/products";
import { getImageUrl } from "../utils/imageUrl";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import Button from "../components/ui/Button";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await getProductById(id);

        const productData =
          response?.product ?? response?.data ?? response;

        if (!productData?.id) {
          throw new Error("Produit introuvable.");
        }

        if (!cancelled) {
          setProduct(productData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Impossible de charger ce produit."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-forest">Chargement du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="font-heading text-3xl text-forest">
          Produit introuvable
        </h1>

        <p className="mt-4 text-red-600">{error}</p>

        <Link
          to="/boutique"
          className="mt-6 inline-block rounded-full bg-forest px-6 py-3 text-white"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.imageUrl);
  const available = product.isActive !== false && product.stock > 0;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <Link
        to="/boutique"
        className="mb-8 inline-flex items-center gap-2 text-sm text-forest hover:underline"
      >
        <ArrowLeft size={17} />
        Retour à la boutique
      </Link>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Image */}
        <div className="flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border border-gold/30 bg-ivory p-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-[480px] w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted">
              <Package size={48} />
              <span>Image à venir</span>
            </div>
          )}
        </div>

        {/* Informations */}
        <div>
          {product.category?.name && (
            <p className="mb-3 text-sm uppercase tracking-widest text-muted">
              {product.category.name}
            </p>
          )}

          <h1 className="font-heading text-4xl text-forest">
            {product.name}
          </h1>

          <p className="mt-6 text-3xl font-semibold text-forest">
            {formatPrice(product.price)}
          </p>

          <div className="mt-5">
            {available ? (
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-800">
                En stock
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-4 py-2 text-sm text-red-700">
                Rupture de stock
              </span>
            )}
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-3 font-heading text-2xl text-forest">
                Description
              </h2>
              <p className="whitespace-pre-line leading-7 text-charcoal">
                {product.description}
              </p>
            </div>
          )}

          {product.usageAdvice && (
            <div className="mt-8">
              <h2 className="mb-3 font-heading text-2xl text-forest">
                Conseils d'utilisation
              </h2>
              <p className="whitespace-pre-line leading-7 text-charcoal">
                {product.usageAdvice}
              </p>
            </div>
          )}

          <div className="mt-8 border-t border-gold/30 pt-5">
            <p className="text-sm text-muted">
              Disponibilité : {available
                ? `${product.stock} unité(s)`
                : "Indisponible"}
            </p>
          </div>
          <div className="mt-8">
            <Button
              disabled={!available}
              onClick={() => addToCart(product, 1)}
              className="flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              Ajouter au panier
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
