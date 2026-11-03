import client from "./client";

export function createOrder(payload) {
  return client.post("/api/orders", payload).then((response) => response.data);
}

export function getOrderById(id) {
  return client.get(`/api/orders/${id}`).then((response) => response.data);
}
