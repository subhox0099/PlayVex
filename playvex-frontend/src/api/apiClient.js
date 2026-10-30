import axios from "axios";
import { isTokenExpired } from "../utils/helpers";

/**
 * ⚠️ Security Note:
 * This app stores the JWT in sessionStorage / localStorage for simplicity.
 * For production, consider HttpOnly cookies managed server-side.
 */

// If VITE_API_BASE_URL is set (e.g. "https://playvex-backend.onrender.com"), use it directly.
// Strip any trailing "/api" or slashes so endpoints like "/api/auth/login" don't become "/api/api/...".
// If left empty, use relative path "" so requests route through Vite's local dev proxy (/api).
const rawBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
const API_BASE_URL = rawBase.replace(/\/api\/?$/i, "").replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for video uploads
});

// ── Request Interceptor: attach JWT and validate token freshness ───────────
apiClient.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("pv_token") || localStorage.getItem("pv_token");

    if (token) {
      if (isTokenExpired(token)) {
        // Token has expired: purge dead session so user is redirected to fresh login
        sessionStorage.removeItem("pv_token");
        sessionStorage.removeItem("pv_user");
        localStorage.removeItem("pv_token");
        localStorage.removeItem("pv_user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(new Error("Your session has expired. Please log in again."));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData uploads, ensure Content-Type is NOT manually set.
    // Letting the browser set it automatically includes the boundary parameter,
    // which Spring Boot requires.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      if (config.headers.delete) {
        config.headers.delete("Content-Type");
      }
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401 & 403 session expiration ─────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const token =
      sessionStorage.getItem("pv_token") || localStorage.getItem("pv_token");

    // If 401 Unauthorized OR (403 Forbidden when token is missing or expired)
    if (status === 401 || (status === 403 && (!token || isTokenExpired(token)))) {
      sessionStorage.removeItem("pv_token");
      sessionStorage.removeItem("pv_user");
      localStorage.removeItem("pv_token");
      localStorage.removeItem("pv_user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
