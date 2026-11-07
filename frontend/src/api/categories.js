
import client from "./client";

// Public : consulter les catégories
export function getCategories() {
  return client.get("/api/categories")
    .then((response) => response.data);
}

export function getCategoryById(id) {
  return client.get(`/api/categories/${id}`)
    .then((response) => response.data);
}

// Admin : ajouter une catégorie
export function createCategory(data) {
  return client.post("/api/categories", data)
    .then((response) => response.data);
}

// Admin : modifier une catégorie
export function updateCategory(id, data) {
  return client.put(`/api/categories/${id}`, data)
    .then((response) => response.data);
}

// Admin : supprimer une catégorie
export function deleteCategory(id) {
  return client.delete(`/api/categories/${id}`)
    .then((response) => response.data);
}
