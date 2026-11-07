import client from "./client";

export function loginAdmin(credentials) {
  return client.post("/api/auth/login", credentials).then((response) => response.data);
}

export function getMe() {
  return client.get("/api/auth/me").then((response) => response.data);
}
