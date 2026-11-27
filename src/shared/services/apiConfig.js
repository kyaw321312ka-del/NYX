const joinBaseUrl = (baseUrl, path, variableName) => {
  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("API path must be a non-empty string.");
  }

  const normalizedBaseUrl = baseUrl?.trim().replace(/\/+$/, "");
  if (!normalizedBaseUrl) {
    throw new Error(`${variableName} must be configured before making API requests.`);
  }

  return `${normalizedBaseUrl}/${path.replace(/^\/+/, "")}`;
};

export const createApiConfig = ({
  VITE_BASE_URL = "",
  VITE_PAYMENT_BASE_URL = "",
} = {}) => ({
  apiUrl: (path) => joinBaseUrl(VITE_BASE_URL, path, "VITE_BASE_URL"),
  paymentApiUrl: (path) =>
    joinBaseUrl(VITE_PAYMENT_BASE_URL, path, "VITE_PAYMENT_BASE_URL"),
});

const viteEnvironment = import.meta.env ?? {};
const apiConfig = createApiConfig(viteEnvironment);

export const { apiUrl, paymentApiUrl } = apiConfig;
