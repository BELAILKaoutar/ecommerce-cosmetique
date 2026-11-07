
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const categoryService = {
  async getAll() {
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des catégories");
    }

    return response.json();
  },
};
