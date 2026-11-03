import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete client.defaults.headers.common.Authorization;
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "La requête a expiré. Veuillez réessayer."
        : error.message) ||
      "Une erreur est survenue";

    const apiError = new Error(message);
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;
    apiError.original = error;

    return Promise.reject(apiError);
  }
);

export default client;
