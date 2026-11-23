import { serviceRepository } from "../repositories/service.repository.js";

class ServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
  }
}

function validateUuid(id) {
  if (
    typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new ServiceError("Identifiant du service invalide", 400);
  }
}

function validateServiceData(data, isUpdate = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ServiceError("Données invalides", 400);
  }

  const result = {};

  if (!isUpdate || data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new ServiceError("Le nom du service est obligatoire", 400);
    }

    const name = data.name.trim();

    if (name.length > 200) {
      throw new ServiceError("Le nom ne doit pas dépasser 200 caractères", 400);
    }

    result.name = name;
  }

  if (data.description !== undefined) {
    if (data.description !== null && typeof data.description !== "string") {
      throw new ServiceError("La description doit être un texte", 400);
    }

    result.description = data.description?.trim() || null;
  }

  if (data.durationMinutes !== undefined) {
    if (
      data.durationMinutes !== null &&
      (!Number.isInteger(data.durationMinutes) ||
        data.durationMinutes <= 0)
    ) {
      throw new ServiceError(
        "La durée doit être un nombre entier positif",
        400
      );
    }

    result.durationMinutes = data.durationMinutes;
  }

  if (data.price !== undefined) {
    if (data.price === null) {
      result.price = null;
    } else {
      const price = data.price;

      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 99999999.99 ||
        !Number.isInteger(Math.round(price * 100) - price * 100)
      ) {
        throw new ServiceError(
          "Le prix doit être un nombre positif ou nul, avec deux décimales maximum",
          400
        );
      }

      result.price = price;
    }
  }

  if (data.isActive !== undefined) {
    if (typeof data.isActive !== "boolean") {
      throw new ServiceError("isActive doit être un booléen", 400);
    }

    result.isActive = data.isActive;
  }

  return result;
}

export const serviceService = {
  async getAllServices() {
    return serviceRepository.findAll();
  },

  async getActiveServices() {
    return serviceRepository.findActive();
  },

  async getServiceById(id, publicAccess = false) {
    validateUuid(id);

    const service = await serviceRepository.findById(id);

    if (!service || (publicAccess && !service.isActive)) {
      throw new ServiceError("Service introuvable", 404);
    }

    return service;
  },

  async createService(data) {
    const validatedData = validateServiceData(data);

    return serviceRepository.create(validatedData);
  },

  async updateService(id, data) {
    await this.getServiceById(id);

    const validatedData = validateServiceData(data, true);

    if (Object.keys(validatedData).length === 0) {
      throw new ServiceError("Aucune donnée à modifier", 400);
    }

    return serviceRepository.update(id, validatedData);
  },

  async deleteService(id) {
    await this.getServiceById(id);

    return serviceRepository.delete(id);
  },
};