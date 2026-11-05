import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { formatPrice } from "../utils/format";
import { useCart } from "../context/CartContext";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ImagePlaceholder from "../components/ui/ImagePlaceholder";
import PageContainer from "../components/ui/PageContainer";

function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  const [imageError, setImageError] = useState(false);

  const stock = Number.isInteger(Number(item.product?.stock))
    ? Number(item.product.stock)
    : null;
  const isMaxStockReached = stock !== null && item.quantity >= stock;
  const isMinQuantityReached = item.quantity <= 1;

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (!isMaxStockReached) {
      onUpdateQuantity(item.product.id, item.quantity + 1);
    }
  };

  const handleInputChange = (event) => {
    const value = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(value)) {
      return;
    }

    if (value < 1) {
      onUpdateQuantity(item.product.id, 1);
    } else if (stock !== null && value > stock) {
      onUpdateQuantity(item.product.id, stock);
    } else {
      onUpdateQuantity(item.product.id, value);
    }
  };

  const unitPrice = Number(item.product.price);
  const lineTotal = Number.isFinite(unitPrice) ? unitPrice * item.quantity : 0;

  return (
    <li className="flex flex-col gap-4 rounded-3xl border border-gold/40 bg-ivory p-4 shadow-[0_4px_20px_rgba(41,45,39,0.03)] transition duration-200 hover:shadow-[0_8px_25px_rgba(54,91,70,0.06)] sm:flex-row sm:items-center sm:p-5">
      {/* Image du produit */}
      <Link
        to={`/produit/${item.product.id}`}
        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gold/30 bg-cream sm:h-28 sm:w-28"
      >
        {item.product.imageUrl && !imageError ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" label="BY WIJO" />
        )}
      </Link>

      {/* Informations produit */}
      <div className="flex flex-1 flex-col justify-between self-stretch">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/produit/${item.product.id}`}
              className="font-heading text-xl font-semibold text-forest transition-colors hover:text-sage sm:text-2xl"
            >
              {item.product.name}
            </Link>

            <button
              type="button"
              onClick={() => onRemove(item.product.id)}
              className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-red-700 sm:hidden"
              aria-label={`Supprimer ${item.product.name} du panier`}
            >
              <Trash2 size={16} />
              <span>Retirer</span>
            </button>
          </div>

          <p className="mt-1 text-sm text-muted">
            Prix unitaire :{" "}
            <span className="font-medium text-charcoal">
              {formatPrice(item.product.price)}
            </span>
          </p>

          {stock !== null && stock <= 5 ? (
            <p className="mt-1 text-xs text-amber-800">
              {stock === 1
                ? "Dernière pièce disponible"
                : `Plus que ${stock} pièces disponibles`}
            </p>
          ) : null}
        </div>

        {/* Contrôles de quantité et sous-total ligne */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Stepper de quantité */}
          <div className="flex items-center">
            <div className="inline-flex items-center rounded-full border border-gold/70 bg-cream p-1 shadow-inner">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isMinQuantityReached}
                className="flex h-8 w-8 items-center justify-center rounded-full text-forest transition hover:bg-sage/20 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Diminuer la quantité de ${item.product.name}`}
              >
                <Minus size={15} />
              </button>

              <label htmlFor={`qty-${item.product.id}`} className="sr-only">
                Quantité pour {item.product.name}
              </label>
              <input
                id={`qty-${item.product.id}`}
                type="number"
                min="1"
                max={stock || undefined}
                value={item.quantity}
                onChange={handleInputChange}
                className="w-12 border-none bg-transparent text-center text-sm font-medium text-charcoal focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={handleIncrement}
                disabled={isMaxStockReached}
                className="flex h-8 w-8 items-center justify-center rounded-full text-forest transition hover:bg-sage/20 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Augmenter la quantité de ${item.product.name}`}
              >
                <Plus size={15} />
              </button>
            </div>

            {isMaxStockReached ? (
              <span className="ml-2 text-xs font-medium text-amber-800">
                Stock max
              </span>
            ) : null}
          </div>

          {/* Sous-total ligne et bouton suppression desktop */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-xs text-muted">Total ligne</span>
              <span className="font-heading text-lg font-semibold text-forest sm:text-xl">
                {formatPrice(lineTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.product.id)}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-700 sm:inline-flex"
              aria-label={`Supprimer ${item.product.name} du panier`}
              title="Supprimer cet article"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Cart() {
  const {
    items,
    itemCount,
    subtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const handleClearCart = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider l'ensemble de votre panier ?")) {
      clearCart();
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <PageContainer>
        {/* Navigation retour */}
        <div className="mb-4">
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-forest"
          >
            <ArrowLeft size={16} />
            <span>Continuer mes achats</span>
          </Link>
        </div>

        {/* En-tête de la page */}
        <div className="flex flex-col justify-between gap-4 border-b border-gold/40 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-sage uppercase">
              Panier
            </p>
            <h1 className="mt-2 font-heading text-4xl text-forest sm:text-5xl">
              Votre sélection
            </h1>
          </div>

          {items.length > 0 ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">
                {itemCount} {itemCount > 1 ? "articles" : "article"}
              </span>
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-muted underline underline-offset-4 transition-colors hover:text-red-700"
              >
                Vider le panier
              </button>
            </div>
          ) : null}
        </div>

        {/* Contenu principal */}
        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<ShoppingBag size={30} strokeWidth={1.5} />}
              title="Votre panier est vide"
              description="Prenez soin de vous en découvrant nos trésors naturels et nos rituels bien-être. Vos articles sélectionnés apparaîtront ici."
            >
              <Button to="/boutique" size="lg">
                Continuer mes achats
              </Button>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px]">
            {/* Liste des articles */}
            <div>
              <ul className="space-y-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </ul>

              <div className="mt-6 flex justify-between border-t border-gold/30 pt-6">
                <Button to="/boutique" variant="ghost" size="sm">
                  <ArrowLeft size={16} />
                  <span>Ajouter d’autres produits</span>
                </Button>
              </div>
            </div>

            {/* Récapitulatif commande */}
            <aside className="h-fit rounded-3xl border border-gold/40 bg-ivory p-6 shadow-[0_8px_30px_rgba(41,45,39,0.04)]">
              <h2 className="font-heading text-2xl font-semibold text-forest">
                Récapitulatif
              </h2>

              <div className="mt-6 space-y-3 divide-y divide-gold/20 text-sm">
                <div className="flex items-center justify-between pb-3 text-muted">
                  <span>
                    Articles ({itemCount})
                  </span>
                  <span className="font-medium text-charcoal">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="pt-3">
                  <div className="flex items-center justify-between text-muted">
                    <span>Livraison estimée</span>
                    <span className="text-xs font-medium text-sage">
                      Calculée à l’étape suivante
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    Marrakech : <strong className="text-forest">20 DH</strong> • Autres villes : <strong className="text-forest">35 DH</strong>
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-4">
                  <div>
                    <p className="text-base font-semibold text-forest">
                      Sous-total panier
                    </p>
                    <p className="text-xs text-muted">
                      Hors frais de livraison
                    </p>
                  </div>
                  <p className="font-heading text-3xl font-semibold text-forest">
                    {formatPrice(subtotal)}
                  </p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="mt-6 space-y-3">
                <Button to="/commande" size="lg" className="w-full">
                  <span>Passer commande</span>
                  <ArrowRight size={18} />
                </Button>
                <Button to="/boutique" variant="outline" className="w-full">
                  Continuer mes achats
                </Button>
              </div>

              {/* Engagements BY WIJO */}
              <div className="mt-8 space-y-2.5 rounded-2xl border border-gold/30 bg-cream/70 p-4 text-xs text-charcoal">
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="shrink-0 text-forest" />
                  <span>Livraison partout au Maroc sous 24h à 72h</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="shrink-0 text-forest" />
                  <span>Paiement en espèces à la livraison (COD)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="shrink-0 text-forest" />
                  <span>Produits 100% naturels et authentiques</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
