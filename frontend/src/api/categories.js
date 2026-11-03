import client from "./client";

export function getCategories() {
  return client.get("/api/categories").then((response) => response.data);
}

export function getCategoryById(id) {
  return client.get(`/api/categories/${id}`).then((response) => response.data);
}
