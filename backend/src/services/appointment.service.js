
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

    const { slotId, customerName, phone } = payload;

    if (!isUuid(slotId)) {
      throw httpError(
        400,
        "Identifiant du créneau invalide."
      );
    }

    validateCustomer(customerName, phone);

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

    if (slot.capacity !== 1) {
      throw httpError(
        409,
        "Ce créneau ne respecte pas la capacité autorisée."
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
      return await appointmentRepository.create({
        slotId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        status: "PENDING",
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
};
