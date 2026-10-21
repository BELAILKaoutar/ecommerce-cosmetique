
import prisma from "../config/prisma.js";
import { appointmentSlotRepository as repository } from "../repositories/appointment-slot.repository.js";

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  return error;
};

const validateUuid = (id) => {
  if (
    typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw httpError(400, "Identifiant UUID invalide.");
  }
};

const parseDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    throw httpError(
      400,
      "startAt doit être une date ISO avec fuseau horaire."
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw httpError(400, "Date de début invalide.");
  }

  return date;
};

const allowedFields = [
  "serviceId",
  "startAt",
  "isActive",
  "capacity",
];

const validatePayload = (payload) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw httpError(400, "Corps de requête invalide.");
  }

  const unknownFields = Object.keys(payload).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    throw httpError(
      400,
      `Champs non autorisés : ${unknownFields.join(", ")}.`
    );
  }

  if (
    payload.capacity !== undefined &&
    payload.capacity !== 1
  ) {
    throw httpError(
      400,
      "Un seul client est autorisé par créneau."
    );
  }

  if (
    payload.isActive !== undefined &&
    typeof payload.isActive !== "boolean"
  ) {
    throw httpError(400, "isActive doit être un booléen.");
  }
};

const getService = async (serviceId) => {
  validateUuid(serviceId);

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw httpError(404, "Service introuvable.");
  }

  if (!service.isActive) {
    throw httpError(400, "Ce service est inactif.");
  }

  if (
    !Number.isInteger(service.durationMinutes) ||
    service.durationMinutes <= 0
  ) {
    throw httpError(
      400,
      "Le service doit avoir une durée valide avant la création d'un créneau."
    );
  }

  return service;
};

const calculateEndAt = (startAt, durationMinutes) =>
  new Date(startAt.getTime() + durationMinutes * 60_000);

const validateFutureDate = (startAt) => {
  if (startAt <= new Date()) {
    throw httpError(
      400,
      "Le créneau doit commencer dans le futur."
    );
  }
};

const checkOverlap = async (
  serviceId,
  startAt,
  endAt,
  excludeId = null
) => {
  const overlap = await repository.findOverlapping(
    serviceId,
    startAt,
    endAt,
    excludeId
  );

  if (overlap) {
    throw httpError(
      409,
      "Un créneau actif existe déjà pour ce service pendant cette période."
    );
  }
};

export const appointmentSlotService = {
  async listPublic(serviceId) {
    if (serviceId !== undefined) {
      validateUuid(serviceId);
    }

    const slots = await repository.findActive();

    return serviceId
      ? slots.filter((slot) => slot.serviceId === serviceId)
      : slots;
  },

  async getPublicById(id) {
    validateUuid(id);

    const slot = await repository.findById(id);

    if (
      !slot ||
      !slot.isActive ||
      !slot.service.isActive ||
      slot.startAt <= new Date()
    ) {
      throw httpError(404, "Créneau indisponible ou introuvable.");
    }

    return slot;
  },

  async listAdmin() {
    return repository.findAll();
  },

  async getAdminById(id) {
    validateUuid(id);

    const slot = await repository.findById(id);

    if (!slot) {
      throw httpError(404, "Créneau introuvable.");
    }

    return slot;
  },

  async create(payload) {
    validatePayload(payload);

    if (!payload.serviceId || !payload.startAt) {
      throw httpError(
        400,
        "serviceId et startAt sont obligatoires."
      );
    }

    const service = await getService(payload.serviceId);
    const startAt = parseDate(payload.startAt);

    validateFutureDate(startAt);

    const endAt = calculateEndAt(
      startAt,
      service.durationMinutes
    );

    const isActive = payload.isActive ?? true;

    if (isActive) {
      await checkOverlap(
        payload.serviceId,
        startAt,
        endAt
      );
    }

    return repository.create({
      serviceId: payload.serviceId,
      startAt,
      endAt,
      capacity: 1,
      isActive,
    });
  },

  async update(id, payload) {
    validateUuid(id);
    validatePayload(payload);

    if (Object.keys(payload).length === 0) {
      throw httpError(400, "Aucune modification fournie.");
    }

    const existing = await repository.findById(id);

    if (!existing) {
      throw httpError(404, "Créneau introuvable.");
    }

    const serviceId =
      payload.serviceId ?? existing.serviceId;

    const service = await getService(serviceId);

    const startAt =
      payload.startAt !== undefined
        ? parseDate(payload.startAt)
        : existing.startAt;

    const isActive =
      payload.isActive ?? existing.isActive;

    if (payload.startAt !== undefined || isActive) {
      validateFutureDate(startAt);
    }

    const endAt = calculateEndAt(
      startAt,
      service.durationMinutes
    );

    if (isActive) {
      await checkOverlap(
        serviceId,
        startAt,
        endAt,
        id
      );
    }

    return repository.update(id, {
      serviceId,
      startAt,
      endAt,
      isActive,
      capacity: 1,
    });
  },

  async remove(id) {
    validateUuid(id);

    const existing = await repository.findById(id);

    if (!existing) {
      throw httpError(404, "Créneau introuvable.");
    }

    return repository.update(id, {
      isActive: false,
    });
  },
};
