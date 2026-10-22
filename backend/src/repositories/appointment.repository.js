
import prisma from "../config/prisma.js";

const appointmentInclude = {
  slot: {
    include: {
      service: true,
    },
  },
};

export const appointmentRepository = {
  async findById(id) {
    return prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    });
  },

  async findActiveBySlot(slotId) {
    return prisma.appointment.findFirst({
      where: {
        slotId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });
  },

  async create(data) {
    return prisma.appointment.create({
      data,
      include: appointmentInclude,
    });
  },

  async findAvailableSlots(serviceId) {
    return prisma.appointmentSlot.findMany({
      where: {
        serviceId,
        isActive: true,
        startAt: {
          gt: new Date(),
        },
        service: {
          isActive: true,
        },
        appointments: {
          none: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
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
};
