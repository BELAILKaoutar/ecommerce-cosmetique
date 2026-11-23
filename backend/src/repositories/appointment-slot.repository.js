
import prisma from "../config/prisma.js";

export const appointmentSlotRepository = {
  async findAll() {
    return prisma.appointmentSlot.findMany({
      include: {
        service: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });
  },

  async findActive() {
    return prisma.appointmentSlot.findMany({
      where: {
        isActive: true,
        startAt: {
          gt: new Date(),
        },
        service: {
          isActive: true,
        },
      },
      include: {
        service: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });
  },

  async findById(id) {
    return prisma.appointmentSlot.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });
  },

  async findOverlapping(serviceId, startAt, endAt, excludeId = null) {
    return prisma.appointmentSlot.findFirst({
      where: {
        serviceId,
        isActive: true,
        startAt: {
          lt: endAt,
        },
        endAt: {
          gt: startAt,
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  async create(data) {
    return prisma.appointmentSlot.create({
      data,
      include: {
        service: true,
      },
    });
  },

  async update(id, data) {
    return prisma.appointmentSlot.update({
      where: { id },
      data,
      include: {
        service: true,
      },
    });
  },

  async delete(id) {
    return prisma.appointmentSlot.delete({
      where: { id },
    });
  },
};
