
import client from "./client";

// Public : consulter les produits
export function getProducts(params = {}) {
  return client.get("/api/products", { params })
    .then((response) => response.data);
}

export async function getProductById(id) {
  const response = await client.get(
    `/api/products/${encodeURIComponent(id)}`
  );

  return response.data;
}
// Admin : ajouter un produit
export function createProduct(data) {
  return client.post("/api/products", data)
    .then((response) => response.data);
}

// Admin : modifier un produit
export function updateProduct(id, data) {
  return client.put(`/api/products/${id}`, data)
    .then((response) => response.data);
}

// Admin : supprimer un produit
export function deleteProduct(id) {
  return client.delete(`/api/products/${id}`)
    .then((response) => response.data);
}
