import client from "./client";

export function getAvailableSlots(serviceId) {
  return client
    .get(`/api/appointments/available-slots/${serviceId}`)
    .then((response) => response.data);
}

export function getAppointmentSlots(serviceId) {
  return client
    .get("/api/appointment-slots", {
      params: serviceId ? { serviceId } : undefined,
    })
    .then((response) => response.data);
}

export function createAppointment(payload) {
  return client.post("/api/appointments", payload).then((response) => response.data);
}
