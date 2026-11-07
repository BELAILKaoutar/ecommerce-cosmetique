
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const categoryApi = {
  async getAll() {
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
      throw new Error("Impossible de charger les catégories");
    }

    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/categories/${id}`);

    if (!response.ok) {
      throw new Error("Catégorie introuvable");
    }

    return response.json();
  },
};
