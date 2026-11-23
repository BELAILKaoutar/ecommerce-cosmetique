import prisma from "../config/prisma.js";
import { appointmentRepository } from "../repositories/appointment.repository.js";

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  return error;
};

const isUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

const validateCustomer = (customerName, phone) => {
  if (
    typeof customerName !== "string" ||
    customerName.trim().length < 2 ||
    customerName.trim().length > 200
  ) {
    throw httpError(
      400,
      "Le nom doit contenir entre 2 et 200 caractères."
    );
  }

  if (
    typeof phone !== "string" ||
    !/^\+?[0-9\s().-]{8,30}$/.test(phone.trim())
  ) {
    throw httpError(
      400,
      "Numéro de téléphone invalide."
    );
  }
};

export const appointmentService = {
  async create(payload) {
    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      throw httpError(
        400,
        "Données de réservation invalides."
      );
    }

    const allowedFields = [
      "slotId",
      "customerName",
      "phone",
      "serviceType",
      "address",
      "notes",
    ];

    const unknownFields = Object.keys(payload).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      throw httpError(
        400,
        `Champs non autorisés : ${unknownFields.join(", ")}.`
      );
    }

    const { slotId, customerName, phone, serviceType = "CENTRE", address, notes } = payload;

    if (!isUuid(slotId)) {
      throw httpError(
        400,
        "Identifiant du créneau invalide."
      );
    }

    validateCustomer(customerName, phone);

    if (!["CENTRE", "DOMICILE"].includes(serviceType)) {
      throw httpError(400, "serviceType doit être 'CENTRE' ou 'DOMICILE'.");
    }

    if (serviceType === "DOMICILE" && (!address || !address.trim())) {
      throw httpError(400, "L'adresse est obligatoire pour un service à domicile.");
    }

    const slot = await prisma.appointmentSlot.findUnique({
      where: {
        id: slotId,
      },
      include: {
        service: true,
      },
    });

    if (!slot) {
      throw httpError(
        404,
        "Créneau introuvable."
      );
    }

    if (!slot.isActive || !slot.service.isActive) {
      throw httpError(
        409,
        "Ce créneau est indisponible."
      );
    }

    if (slot.startAt <= new Date()) {
      throw httpError(
        409,
        "Ce créneau est déjà passé."
      );
    }

    const existing = await appointmentRepository.findActiveBySlot(
      slotId
    );

    if (existing) {
      throw httpError(
        409,
        "Ce créneau est déjà réservé."
      );
    }

    try {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      return await appointmentRepository.create({
        slotId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        serviceType,
        address: address ? address.trim() : null,
        notes: notes ? notes.trim() : null,
        status: "PENDING",
        expiresAt,
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw httpError(
          409,
          "Ce créneau vient d'être réservé par une autre cliente."
        );
      }

      throw error;
    }
  },

  async getById(id) {
    if (!isUuid(id)) {
      throw httpError(
        400,
        "Identifiant de réservation invalide."
      );
    }

    const appointment = await appointmentRepository.findById(
      id
    );

    if (!appointment) {
      throw httpError(
        404,
        "Réservation introuvable."
      );
    }

    return appointment;
  },

  async availableSlots(serviceId) {
    if (!isUuid(serviceId)) {
      throw httpError(
        400,
        "Identifiant du service invalide."
      );
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service || !service.isActive) {
      throw httpError(
        404,
        "Service introuvable ou inactif."
      );
    }

    return appointmentRepository.findAvailableSlots(
      serviceId
    );
  },

  // Fonctions d'administration
  async list(filters = {}) {
    const where = {};

    if (filters.status && filters.status !== "ALL") {
      if (!APPOINTMENT_STATUSES.includes(filters.status)) {
        throw httpError(400, "Statut de réservation invalide.");
      }
      where.status = filters.status;
    }

    if (filters.serviceId) {
      if (!isUuid(filters.serviceId)) {
        throw httpError(400, "Identifiant du service invalide.");
      }
      where.slot = {
        serviceId: filters.serviceId,
      };
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
    }

    return appointmentRepository.findAll(where);
  },

  async updateStatus(id, status) {
    if (!isUuid(id)) {
      throw httpError(400, "Identifiant de réservation invalide.");
    }

    if (!APPOINTMENT_STATUSES.includes(status)) {
      throw httpError(400, "Statut de réservation invalide.");
    }

    await this.getById(id);

    return appointmentRepository.updateStatus(id, status);
  },

  async confirm(id) {
    return this.updateStatus(id, "CONFIRMED");
  },

  async cancel(id) {
    return this.updateStatus(id, "CANCELLED");
  },

  async getAvailableDates() {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 60); // 60 jours
    return appointmentRepository.findAvailableDates(from, to);
  },

  async getSlotsForDate(dateStr) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw httpError(400, "Format de date invalide. Utilisez YYYY-MM-DD.");
    }
    return appointmentRepository.findAvailableSlotsByDate(dateStr);
  },
};
