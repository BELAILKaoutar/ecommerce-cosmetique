import client from "./client";

export function getProducts(params = {}) {
  return client.get("/api/products", { params }).then((response) => response.data);
}

export function getProductById(id) {
  return client.get(`/api/products/${id}`).then((response) => response.data);
}
