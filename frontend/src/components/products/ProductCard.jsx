import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";
import Button from "../ui/Button";
import ImagePlaceholder from "../ui/ImagePlaceholder";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imageFailed, setImageFailed] = useState(false);

  if (!product) {
    return null;
  }

  const inStock = product.isActive !== false && Number(product.stock) > 0;
  const showImage = Boolean(product.imageUrl) && !imageFailed;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gold/40 bg-ivory shadow-[0_10px_30px_rgba(41,45,39,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(54,91,70,0.12)]">
      <Link
        to={`/produit/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-cream"
      >
        {showImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </Link>

      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="font-heading text-2xl leading-snug text-forest">
          <Link to={`/produit/${product.id}`} className="hover:text-sage">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-lg text-charcoal">{formatPrice(product.price)}</p>
        <p className={`mt-1 text-sm ${inStock ? "text-sage" : "text-muted"}`}>
          {inStock ? "En stock" : "Indisponible"}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
          <Button
            size="sm"
            className="flex-1"
            disabled={!inStock}
            onClick={() => addToCart(product, 1)}
          >
            Ajouter
          </Button>
          <Button to={`/produit/${product.id}`} variant="outline" size="sm" className="flex-1">
            Détails
          </Button>
        </div>
      </div>
    </article>
  );
}
