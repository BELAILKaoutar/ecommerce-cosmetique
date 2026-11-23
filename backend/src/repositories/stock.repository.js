
import prisma from "../config/prisma.js";

export const stockRepository = {
  // Ajouter une quantité au stock
  async increaseStock(productId, quantity) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  },

  // Définir une nouvelle quantité
  async setStock(productId, quantity) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        stock: quantity,
      },
    });
  },

  // Consulter les produits avec leur stock
  async getAllStocks() {
    return prisma.product.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        stock: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  },
};
