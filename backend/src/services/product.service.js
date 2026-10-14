
import { productRepository } from "../repositories/product.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";

class ProductError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ProductError";
    this.statusCode = statusCode;
  }
}

const isValidUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function validateProductData(data, isUpdate = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ProductError("Données du produit invalides", 400);
  }

  const result = {};

  // Nom du produit
  if (!isUpdate || data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new ProductError("Le nom du produit est obligatoire", 400);
    }

    if (data.name.trim().length > 200) {
      throw new ProductError("Le nom ne doit pas dépasser 200 caractères", 400);
    }

    result.name = data.name.trim();
  }

  // Prix du produit
  if (!isUpdate || data.price !== undefined) {
    if (
      typeof data.price !== "number" ||
      !Number.isFinite(data.price) ||
      data.price < 0 ||
      Math.round(data.price * 100) !== data.price * 100
    ) {
      throw new ProductError(
        "Le prix doit être un nombre positif ou nul avec deux décimales maximum",
        400
      );
    }

    result.price = data.price;
  }

  // Stock
  if (!isUpdate || data.stock !== undefined) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      throw new ProductError(
        "Le stock doit être un entier positif ou nul",
        400
      );
    }

    result.stock = data.stock;
  }

  // Catégorie
  if (!isUpdate || data.categoryId !== undefined) {
    if (!isValidUuid(data.categoryId)) {
      throw new ProductError("Identifiant de catégorie invalide", 400);
    }

    result.categoryId = data.categoryId;
  }

  // Description, conseils d'utilisation et image
  for (const field of ["description", "usageAdvice", "imageUrl"]) {
    if (data[field] !== undefined) {
      if (data[field] !== null && typeof data[field] !== "string") {
        throw new ProductError(`Le champ ${field} doit être un texte`, 400);
      }

      result[field] = data[field]?.trim() || null;
    }
  }

  // Disponibilité administrative du produit
  if (data.isActive !== undefined) {
    if (typeof data.isActive !== "boolean") {
      throw new ProductError("isActive doit être un booléen", 400);
    }

    result.isActive = data.isActive;
  }

  return result;
}

async function ensureCategoryExists(categoryId) {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new ProductError("Catégorie introuvable", 404);
  }
}

export const productService = {
  // GET : récupérer tous les produits
  async getAllProducts(filters = {}) {
    const where = {};

    if (filters.categoryId !== undefined) {
      if (!isValidUuid(filters.categoryId)) {
        throw new ProductError("Identifiant de catégorie invalide", 400);
      }
      where.categoryId = filters.categoryId;
    }

    if (filters.name !== undefined) {
      if (typeof filters.name !== "string") {
        throw new ProductError("Filtre name invalide", 400);
      }

      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters.isActive !== undefined) {
      if (!["true", "false"].includes(filters.isActive)) {
        throw new ProductError("Le filtre isActive doit être true ou false", 400);
      }
      where.isActive = filters.isActive === "true";
    }

    if (filters.available !== undefined) {
      if (!["true", "false"].includes(filters.available)) {
        throw new ProductError("Le filtre available doit être true ou false", 400);
      }

      if (filters.available === "true") {
        where.isActive = true;
        where.stock = { gt: 0 };
      } else {
        where.OR = [
          { isActive: false },
          { stock: 0 },
        ];
      }
    }

    return productRepository.findAll(where);
  },

  // GET : récupérer un produit par ID
  async getProductById(id) {
    if (!isValidUuid(id)) {
      throw new ProductError("Identifiant de produit invalide", 400);
    }

    const product = await productRepository.findById(id);

    if (!product) {
      throw new ProductError("Produit introuvable", 404);
    }

    return product;
  },

  // POST : créer un produit
  async createProduct(data) {
    const validatedData = validateProductData(data);

    await ensureCategoryExists(validatedData.categoryId);

    return productRepository.create(validatedData);
  },

  // PUT : modifier un produit
  async updateProduct(id, data) {
    await this.getProductById(id);

    const validatedData = validateProductData(data, true);

    if (Object.keys(validatedData).length === 0) {
      throw new ProductError("Aucune donnée à modifier", 400);
    }

    if (validatedData.categoryId !== undefined) {
      await ensureCategoryExists(validatedData.categoryId);
    }

    return productRepository.update(id, validatedData);
  },

  // DELETE : supprimer un produit
  async deleteProduct(id) {
    await this.getProductById(id);

    return productRepository.delete(id);
  },
};
