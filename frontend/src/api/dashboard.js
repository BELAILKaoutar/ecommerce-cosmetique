import client from "./client";

export function getDashboardStats() {
  return client.get("/api/admin/dashboard/stats").then((response) => response.data);
}
