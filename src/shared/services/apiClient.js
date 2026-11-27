import { apiUrl, paymentApiUrl } from "./apiConfig";

export const apiFetch = (path, options) => fetch(apiUrl(path), options);

export const paymentApiFetch = (path, options) =>
  fetch(paymentApiUrl(path), options);
