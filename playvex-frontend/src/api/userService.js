import apiClient from "./apiClient";

/**
 * User Service
 * GET    /api/users/profile
 * PATCH  /api/users/update-name
 * PATCH  /api/users/update-email
 * PATCH  /api/users/change-password
 * PATCH  /api/users/update-profile-picture   (multipart)
 * DELETE /api/users/delete-account
 */

export const getProfile = () => apiClient.get("/api/users/profile");

export const updateName = (username) =>
  apiClient.patch("/api/users/update-name", { username });

export const updateEmail = (email) =>
  apiClient.patch("/api/users/update-email", { email });

export const changePassword = (currentPassword, newPassword) =>
  apiClient.patch("/api/users/change-password", { currentPassword, newPassword });

export const updateProfilePicture = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  // Do NOT pass manual Content-Type header; browser must set boundary
  return apiClient.patch("/api/users/update-profile-picture", formData);
};

export const deleteAccount = (password) =>
  apiClient.delete("/api/users/delete-account", { data: { password } });
