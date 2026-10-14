
import prisma from "../config/prisma.js";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  },

  findById(id) {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  findByName(name) {
    return prisma.category.findUnique({
      where: { name },
    });
  },

  create(data) {
    return prisma.category.create({
      data,
    });
  },

  update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  delete(id) {
    return prisma.category.delete({
      where: { id },
    });
  },

  countProducts(id) {
    return prisma.product.count({
      where: { categoryId: id },
    });
  },
};
