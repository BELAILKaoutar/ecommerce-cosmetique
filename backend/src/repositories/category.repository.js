import prisma from "../config/prisma.js";

const categoryInclude = {
  _count: {
    select: { products: true },
  },
  products: {
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      imageUrl: true,
      isActive: true,
    },
    orderBy: { name: "asc" },
  },
};

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      include: categoryInclude,
      orderBy: { name: "asc" },
    });
  },

  findById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
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
      include: categoryInclude,
    });
  },

  update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
      include: categoryInclude,
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
