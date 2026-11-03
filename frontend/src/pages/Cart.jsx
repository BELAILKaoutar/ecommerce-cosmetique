import { formatPrice } from "../utils/format";
import { useCart } from "../context/CartContext";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import PageContainer from "../components/ui/PageContainer";

export default function Cart() {
  const { items, subtotal, removeFromCart, updateQuantity } = useCart();

  return (
    <section className="py-16 sm:py-20">
      <PageContainer>
        <p className="text-xs font-medium tracking-[0.28em] text-sage uppercase">
          Panier
        </p>
        <h1 className="mt-3 font-heading text-4xl text-forest sm:text-5xl">
          Votre sélection
        </h1>

        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Votre panier est vide"
              description="Les articles ajoutés depuis la boutique apparaîtront ici."
            >
              <Button to="/boutique">Continuer vos achats</Button>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex flex-col gap-4 rounded-3xl border border-gold/40 bg-ivory p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <p className="font-heading text-2xl text-forest">
                      {item.product.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={`qty-${item.product.id}`}>
                      Quantité
                    </label>
                    <input
                      id={`qty-${item.product.id}`}
                      type="number"
                      min="1"
                      max={item.product.stock || undefined}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.product.id, event.target.value)
                      }
                      className="w-20 rounded-full border border-gold/70 bg-cream px-3 py-2 text-center"
                    />
                    <button
                      type="button"
                      className="text-sm text-muted hover:text-forest"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-3xl border border-gold/40 bg-ivory p-6">
              <p className="text-sm text-muted">Sous-total</p>
              <p className="mt-2 font-heading text-3xl text-forest">
                {formatPrice(subtotal)}
              </p>
              <Button to="/commande" className="mt-6 w-full">
                Passer commande
              </Button>
              <Button to="/boutique" variant="ghost" className="mt-3 w-full">
                Continuer vos achats
              </Button>
            </aside>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
