import { apiFetch } from "../../../../shared/services/apiClient";

export const getMobileBookings = () =>
  apiFetch("/api/mobilerental/showmobilebooking", {
    method: "GET",
  });

export const getLocalBookings = () =>
  apiFetch("/api/localbooking/showlocalbooking", {
    method: "GET",
  });
