import prisma from "../config/prisma.js";

export const serviceRepository = {
  findAll() {
    return prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  findActive() {
    return prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id) {
    return prisma.service.findUnique({
      where: { id },
    });
  },

  create(data) {
    return prisma.service.create({
      data,
    });
  },

  update(id, data) {
    return prisma.service.update({
      where: { id },
      data,
    });
  },

  delete(id) {
    return prisma.service.delete({
      where: { id },
    });
  },
};