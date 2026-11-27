import { apiFetch } from "../../../shared/services/apiClient";

export const loginWithCredentials = (credentials) =>
  apiFetch("/api/auth/adminlogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
