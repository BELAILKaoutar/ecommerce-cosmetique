import client from "./client";

// Routes publiques
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

// Routes d'administration
export function getAdminAppointments(params = {}) {
  return client
    .get("/api/admin/appointments", { params })
    .then((response) => response.data);
}

export function getAdminAppointmentById(id) {
  return client
    .get(`/api/admin/appointments/${id}`)
    .then((response) => response.data);
}

export function updateAppointmentStatus(id, status) {
  return client
    .patch(`/api/admin/appointments/${id}/status`, { status })
    .then((response) => response.data);
}

export function confirmAppointment(id) {
  return client
    .post(`/api/admin/appointments/${id}/confirm`)
    .then((response) => response.data);
}

export function cancelAppointment(id) {
  return client
    .post(`/api/admin/appointments/${id}/cancel`)
    .then((response) => response.data);
}
