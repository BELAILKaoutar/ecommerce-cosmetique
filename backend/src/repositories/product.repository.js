
import prisma from "../config/prisma.js";

export const productRepository = {
  // Récupérer tous les produits
  findAll(filters = {}) {
    return prisma.product.findMany({
      where: filters,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Récupérer un produit par ID
  findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  },

  // Créer un produit
  create(data) {
    return prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  },

  // Modifier un produit
  update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  },

  // Supprimer un produit
  delete(id) {
    return prisma.product.delete({
      where: { id },
    });
  },
};
