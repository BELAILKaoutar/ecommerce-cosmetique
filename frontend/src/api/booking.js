import client from "./client";

export function getAvailableDates() {
  return client.get("/api/appointments/available-dates").then((r) => r.data);
}

export function getAvailableSlots(date) {
  return client
    .get("/api/appointments/available-slots", { params: { date } })
    .then((r) => r.data);
}

export function createAppointment(payload) {
  return client.post("/api/appointments", payload).then((r) => r.data);
}
