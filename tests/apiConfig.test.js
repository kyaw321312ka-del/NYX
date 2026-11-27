import assert from "node:assert/strict";
import test from "node:test";
import { createApiConfig } from "../src/shared/services/apiConfig.js";

test("joins API paths without duplicate slashes", () => {
  const { apiUrl } = createApiConfig({
    VITE_BASE_URL: "https://api.example.com///",
  });

  assert.equal(apiUrl("/api/products"), "https://api.example.com/api/products");
});

test("uses a separate payment API base URL", () => {
  const { paymentApiUrl } = createApiConfig({
    VITE_PAYMENT_BASE_URL: "https://payments.example.com/",
  });

  assert.equal(
    paymentApiUrl("/api/cart/showPayment"),
    "https://payments.example.com/api/cart/showPayment",
  );
});

test("fails explicitly when an API base URL is missing", () => {
  const { apiUrl } = createApiConfig();

  assert.throws(() => apiUrl("/api/products"), /VITE_BASE_URL must be configured/);
});

test("rejects empty API paths", () => {
  const { apiUrl } = createApiConfig({ VITE_BASE_URL: "https://api.example.com" });

  assert.throws(() => apiUrl(" "), /API path must be a non-empty string/);
});
