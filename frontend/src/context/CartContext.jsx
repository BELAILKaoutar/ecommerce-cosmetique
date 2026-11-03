import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "by-wijo-cart";
const CartContext = createContext(null);

function toPositiveInt(value) {
  const quantity = Number.parseInt(value, 10);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
}

function maxAllowedQuantity(product, requested) {
  const quantity = toPositiveInt(requested);
  const stock = Number(product?.stock);

  if (Number.isInteger(stock) && stock >= 0) {
    return Math.min(quantity, stock);
  }

  return quantity;
}

function canAddProduct(product) {
  if (!product?.id) {
    return false;
  }

  if (product.isActive === false) {
    return false;
  }

  const stock = Number(product.stock);
  if (Number.isInteger(stock) && stock <= 0) {
    return false;
  }

  return true;
}

function snapshotProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    imageUrl: product.imageUrl || null,
    stock: Number.isInteger(Number(product.stock)) ? Number(product.stock) : null,
    isActive: product.isActive !== false,
  };
}

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item?.product?.id && toPositiveInt(item.quantity))
      .map((item) => ({
        product: snapshotProduct(item.product),
        quantity: maxAllowedQuantity(item.product, item.quantity),
      }))
      .filter((item) => item.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.product.price);
      return sum + (Number.isFinite(price) ? price * item.quantity : 0);
    }, 0);

    function addToCart(product, quantity = 1) {
      if (!canAddProduct(product)) {
        return { ok: false, reason: "unavailable" };
      }

      const snapshot = snapshotProduct(product);

      setItems((current) => {
        const existing = current.find((item) => item.product.id === snapshot.id);
        const nextQuantity = maxAllowedQuantity(
          snapshot,
          (existing?.quantity || 0) + toPositiveInt(quantity)
        );

        if (nextQuantity <= 0) {
          return current;
        }

        if (existing) {
          return current.map((item) =>
            item.product.id === snapshot.id
              ? { product: snapshot, quantity: nextQuantity }
              : item
          );
        }

        return [...current, { product: snapshot, quantity: nextQuantity }];
      });

      return { ok: true };
    }

    function removeFromCart(productId) {
      setItems((current) => current.filter((item) => item.product.id !== productId));
    }

    function updateQuantity(productId, quantity) {
      setItems((current) =>
        current
          .map((item) => {
            if (item.product.id !== productId) {
              return item;
            }

            const nextQuantity = maxAllowedQuantity(item.product, quantity);
            return { ...item, quantity: nextQuantity };
          })
          .filter((item) => item.quantity > 0)
      );
    }

    function clearCart() {
      setItems([]);
    }

    return {
      items,
      itemCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart doit être utilisé dans un CartProvider");
  }

  return context;
}
