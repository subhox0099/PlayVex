import apiClient from "./apiClient";

/**
 * Auth Service
 * POST /api/auth/register
 * POST /api/auth/login
 */

export const register = (data) =>
  apiClient.post("/api/auth/register", {
    username: data.username,
    email: data.email,
    password: data.password,
  });

export const login = (data) =>
  apiClient.post("/api/auth/login", {
    email: data.email,
    password: data.password,
  });
