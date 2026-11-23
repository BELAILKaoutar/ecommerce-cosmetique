import prisma from "../config/prisma.js";

const appointmentInclude = {
  slot: {
    include: {
      service: true,
    },
  },
};

export const appointmentRepository = {
  async findAll(where = {}, orderBy = { createdAt: "desc" }) {
    return prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy,
    });
  },

  async count(where = {}) {
    return prisma.appointment.count({
      where,
    });
  },

  async updateStatus(id, status) {
    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: appointmentInclude,
    });
  },

  async findById(id) {
    return prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    });
  },

  async findActiveBySlot(slotId) {
    const now = new Date();
    return prisma.appointment.findFirst({
      where: {
        slotId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          { status: "CONFIRMED" },
          {
            status: "PENDING",
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
        ],
      },
    });
  },

  async create(data) {
    return prisma.appointment.create({
      data,
      include: appointmentInclude,
    });
  },

  async findAvailableDates(fromDate, toDate) {
    const slots = await prisma.appointmentSlot.findMany({
      where: {
        isActive: true,
        startAt: { gte: fromDate, lte: toDate },
        service: { isActive: true },
        appointments: {
          none: {
            status: { in: ["CONFIRMED"] },
          },
        },
      },
      select: { startAt: true },
      orderBy: { startAt: "asc" },
    });
    // Dédoublonner les dates (format YYYY-MM-DD)
    const dates = [...new Set(slots.map(s => s.startAt.toISOString().split("T")[0]))];
    return dates;
  },

  async findAvailableSlotsByDate(dateStr) {
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T23:59:59.999Z`);
    const now = new Date();
    const pendingExpiry = new Date(now.getTime() - 30 * 60 * 1000); // 30 min

    return prisma.appointmentSlot.findMany({
      where: {
        isActive: true,
        startAt: { gte: start > now ? start : now, lte: end },
        service: { isActive: true },
        appointments: {
          none: {
            OR: [
              { status: "CONFIRMED" },
              {
                status: "PENDING",
                AND: [
                  { expiresAt: null },
                  { createdAt: { gte: pendingExpiry } },
                ],
              },
              {
                status: "PENDING",
                expiresAt: { gt: now },
              },
            ],
          },
        },
      },
      include: { service: true },
      orderBy: { startAt: "asc" },
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
