import { apiFetch } from "../../../../shared/services/apiClient";

export const getRemainingBookings = (id, date) =>
  apiFetch(`/api/venue/remainbookingslot/${id}/${date}`, {
    method: "GET",
  });
