
import { categoryRepository } from "../repositories/category.repository.js";

// Erreur métier avec code HTTP
class CategoryError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "CategoryError";
    this.statusCode = statusCode;
  }
}

export const categoryService = {
  // Récupérer toutes les catégories
  async getAllCategories() {
    return categoryRepository.findAll();
  },

  // Récupérer une catégorie par ID
  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new CategoryError("Catégorie introuvable", 404);
    }

    return category;
  },

  // Créer une catégorie
  async createCategory(data) {
    const name = data.name?.trim();

    if (!name) {
      throw new CategoryError("Le nom est obligatoire", 400);
    }

    const existingCategory = await categoryRepository.findByName(name);

    if (existingCategory) {
      throw new CategoryError("Cette catégorie existe déjà", 409);
    }

    return categoryRepository.create({
      name,
      description: data.description?.trim() || null,
    });
  },

  // Modifier une catégorie
  async updateCategory(id, data) {
    await this.getCategoryById(id);

    const updateData = {};

    if (data.name !== undefined) {
      const name = data.name?.trim();

      if (!name) {
        throw new CategoryError("Le nom ne peut pas être vide", 400);
      }

      const existingCategory = await categoryRepository.findByName(name);

      if (existingCategory && existingCategory.id !== id) {
        throw new CategoryError("Cette catégorie existe déjà", 409);
      }

      updateData.name = name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    return categoryRepository.update(id, updateData);
  },

  // Supprimer une catégorie
  async deleteCategory(id) {
    await this.getCategoryById(id);

    const productCount = await categoryRepository.countProducts(id);

    if (productCount > 0) {
      throw new CategoryError(
        "Impossible de supprimer une catégorie contenant des produits",
        409
      );
    }

    return categoryRepository.delete(id);
  },
};
