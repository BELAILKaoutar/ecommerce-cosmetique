import prisma from "../config/prisma.js";

const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          stock: true,
          isActive: true,
        },
      },
    },
    orderBy: { productName: "asc" },
  },
};

export const orderRepository = {
  create(data) {
    return prisma.order.create({
      data,
      include: orderInclude,
    });
  },

  findById(id, client = prisma) {
    return client.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  findAll(where = {}) {
    return prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async runTransaction(callback) {
    return prisma.$transaction(callback, {
      isolationLevel: "ReadCommitted",
      timeout: 10000,
    });
  },
};
