import client from "./client";

export function getServices() {
  return client.get("/api/services").then((response) => response.data);
}

export function getServiceById(id) {
  return client.get(`/api/services/${id}`).then((response) => response.data);
}
