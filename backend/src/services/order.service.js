import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { AppError } from "../utils/app-error.js";
import { getDeliveryFee } from "../utils/delivery.js";
import { roundMoney, serializeOrder } from "../utils/money.js";
import { generateOrderNumber } from "../utils/order-number.js";
import { isValidUuid } from "../utils/uuid.js";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertUuid(id, message) {
  if (!isValidUuid(id)) {
    throw new AppError(message, 400);
  }
}

function mergeItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError("Le panier doit contenir au moins un article", 400);
  }

  const quantities = new Map();

  for (const item of rawItems) {
    if (!item || typeof item !== "object") {
      throw new AppError("Article de commande invalide", 400);
    }

    assertUuid(item.productId, "Identifiant de produit invalide");

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new AppError("La quantité doit être un entier positif", 400);
    }

    quantities.set(
      item.productId,
      (quantities.get(item.productId) || 0) + item.quantity
    );
  }

  return [...quantities.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function validateGuestCustomer(data) {
  const customerName = data?.customerName?.trim();
  const customerEmail = data?.customerEmail?.trim().toLowerCase();
  const customerPhone = data?.customerPhone?.trim();
  const address = data?.address?.trim();
  const city = data?.city?.trim();

  if (!customerName) {
    throw new AppError("Le nom du client est obligatoire", 400);
  }
  if (!customerEmail || !EMAIL_REGEX.test(customerEmail)) {
    throw new AppError("L'email du client est invalide", 400);
  }
  if (!customerPhone) {
    throw new AppError("Le téléphone du client est obligatoire", 400);
  }
  if (!address) {
    throw new AppError("L'adresse de livraison est obligatoire", 400);
  }
  if (!city) {
    throw new AppError("La ville est obligatoire", 400);
  }

  return { customerName, customerEmail, customerPhone, address, city };
}

async function loadOrderOrThrow(id, client) {
  assertUuid(id, "Identifiant de commande invalide");
  const order = await orderRepository.findById(id, client);

  if (!order) {
    throw new AppError("Commande introuvable", 404);
  }

  return order;
}

async function lockProducts(tx, items) {
  const ids = [...new Set(items.map((item) => item.productId))].sort();

  for (const id of ids) {
    await tx.$queryRaw`
      SELECT id FROM products WHERE id = ${id}::uuid FOR UPDATE
    `;
  }
}

async function deductStock(tx, items) {
  await lockProducts(tx, items);

  for (const item of items) {
    const updated = await tx.product.updateMany({
      where: {
        id: item.productId,
        isActive: true,
        stock: { gte: item.quantity },
      },
      data: {
        stock: { decrement: item.quantity },
      },
    });

    if (updated.count !== 1) {
      throw new AppError(
        `Stock insuffisant pour l'article ${item.productName}`,
        409
      );
    }
  }
}

async function restoreStock(tx, items) {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: { increment: item.quantity },
      },
    });
  }
}

export const orderService = {
  async createOrder(payload) {
    const customer = validateGuestCustomer(payload);
    const requestedItems = mergeItems(payload.items);

    const products = await Promise.all(
      requestedItems.map(async (item) => {
        const product = await productRepository.findById(item.productId);

        if (!product || !product.isActive) {
          throw new AppError("Produit introuvable ou indisponible", 404);
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `Stock insuffisant pour le produit ${product.name}`,
            409
          );
        }

        const unitPrice = roundMoney(product.price);
        const lineTotal = roundMoney(unitPrice * item.quantity);

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        };
      })
    );

    const subtotal = roundMoney(
      products.reduce((sum, item) => sum + item.lineTotal, 0)
    );
    const deliveryFee = getDeliveryFee(customer.city);
    const total = roundMoney(subtotal + deliveryFee);

    const order = await orderRepository.create({
      ...customer,
      orderNumber: generateOrderNumber(),
      subtotal,
      deliveryFee,
      total,
      status: "PENDING",
      stockDeducted: false,
      confirmedAt: null,
      items: {
        create: products,
      },
    });

    return serializeOrder(order);
  },

  async getOrderById(id) {
    const order = await loadOrderOrThrow(id);
    return serializeOrder(order);
  },

  async listOrders(filters = {}) {
    const where = {};

    if (filters.status !== undefined) {
      if (!ORDER_STATUSES.includes(filters.status)) {
        throw new AppError("Statut de commande invalide", 400);
      }
      where.status = filters.status;
    }

    const orders = await orderRepository.findAll(where);
    return orders.map(serializeOrder);
  },

  async confirmOrder(id) {
    return orderRepository.runTransaction(async (tx) => {
      const order = await loadOrderOrThrow(id, tx);

      if (order.status === "CONFIRMED" || order.stockDeducted) {
        throw new AppError("Cette commande a déjà été confirmée", 409);
      }

      if (order.status !== "PENDING") {
        throw new AppError(
          "Seule une commande en attente peut être confirmée",
          409
        );
      }

      await deductStock(tx, order.items);

      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
          stockDeducted: false,
        },
        data: {
          status: "CONFIRMED",
          stockDeducted: true,
          confirmedAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        throw new AppError("Cette commande a déjà été confirmée", 409);
      }

      return serializeOrder(await orderRepository.findById(order.id, tx));
    });
  },

  async cancelOrder(id) {
    return orderRepository.runTransaction(async (tx) => {
      const order = await loadOrderOrThrow(id, tx);

      if (order.status === "CANCELLED") {
        throw new AppError("Cette commande est déjà annulée", 409);
      }

      if (order.status === "DELIVERED") {
        throw new AppError("Une commande livrée ne peut pas être annulée", 409);
      }

      if (order.status === "SHIPPED") {
        throw new AppError(
          "Une commande expédiée ne peut plus être annulée",
          409
        );
      }

      const claimedConfirmed = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "CONFIRMED",
          stockDeducted: true,
        },
        data: {
          status: "CANCELLED",
          stockDeducted: false,
        },
      });

      if (claimedConfirmed.count === 1) {
        await restoreStock(tx, order.items);
        return serializeOrder(await orderRepository.findById(order.id, tx));
      }

      const claimedPending = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      });

      if (claimedPending.count !== 1) {
        throw new AppError("L'annulation n'a pas pu être effectuée", 409);
      }

      return serializeOrder(await orderRepository.findById(order.id, tx));
    });
  },

  async updateStatus(id, status) {
    if (typeof status !== "string" || !ORDER_STATUSES.includes(status)) {
      throw new AppError("Statut de commande invalide", 400);
    }

    if (status === "CONFIRMED") {
      return this.confirmOrder(id);
    }

    if (status === "CANCELLED") {
      return this.cancelOrder(id);
    }

    return orderRepository.runTransaction(async (tx) => {
      const order = await loadOrderOrThrow(id, tx);

      const allowed = {
        SHIPPED: ["CONFIRMED"],
        DELIVERED: ["SHIPPED"],
      };

      if (!allowed[status]?.includes(order.status)) {
        throw new AppError(
          `Impossible de passer de ${order.status} à ${status}`,
          409
        );
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status },
      });

      return serializeOrder(await orderRepository.findById(order.id, tx));
    });
  },
};
