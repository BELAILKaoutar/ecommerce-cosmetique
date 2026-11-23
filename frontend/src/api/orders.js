import client from "./client";

// Routes publiques (Guest Checkout)
export function createOrder(payload) {
  return client.post("/api/orders", payload).then((response) => response.data);
}

export function getOrderById(id) {
  return client.get(`/api/orders/${id}`).then((response) => response.data);
}

// Routes d'administration
export function getAdminOrders(params = {}) {
  return client.get("/api/admin/orders", { params }).then((response) => response.data);
}

export function getAdminOrderById(id) {
  return client.get(`/api/admin/orders/${id}`).then((response) => response.data);
}

export function confirmOrder(id) {
  return client.post(`/api/admin/orders/${id}/confirm`).then((response) => response.data);
}

export function cancelOrder(id) {
  return client.post(`/api/admin/orders/${id}/cancel`).then((response) => response.data);
}

export function updateOrderStatus(id, status) {
  return client.patch(`/api/admin/orders/${id}/status`, { status }).then((response) => response.data);
}
