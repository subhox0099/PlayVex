import apiClient from "./apiClient";

/**
 * Video Service
 * GET    /api/videos/allvideos
 * GET    /api/videos/my-videos
 * GET    /api/videos/search?keyword=
 * GET    /api/videos/{id}/play       — returns binary stream
 * POST   /api/videos/upload          — multipart
 * POST   /api/videos/{id}/view
 * PATCH  /api/videos/{id}/title
 * PATCH  /api/videos/{id}/description
 * PATCH  /api/videos/{id}
 * DELETE /api/videos/{id}
 */

export const getAllVideos = () => apiClient.get("/api/videos/allvideos");

export const getMyVideos = () => apiClient.get("/api/videos/my-videos");

export const searchVideos = (keyword) =>
  apiClient.get("/api/videos/search", { params: { keyword } });

/**
 * Fetch video as a Blob for playback.
 */
export const getVideoBlob = (id) =>
  apiClient.get(`/api/videos/${id}/play`, { responseType: "blob" });

export const getVideoUrl = (id) => {
  const rawBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const base = rawBase.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  return `${base}/api/videos/${id}/play`;
};

export const uploadVideo = (file, title, description, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (description) formData.append("description", description);

  return apiClient.post("/api/videos/upload", formData, {
    // If Spring Boot returns circular or truncated JSON from savedvideo entity,
    // parse safely so the client doesn't throw a parsing syntax error.
    transformResponse: [
      (data) => {
        if (typeof data !== "string") return data;
        try {
          return JSON.parse(data);
        } catch {
          // If Jackson returns circular truncated JSON, return a valid object
          return { success: true };
        }
      },
    ],
    onUploadProgress: onProgress
      ? (evt) => {
          if (evt.total) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        }
      : undefined,
  });
};

export const incrementViews = (id) =>
  apiClient.post(`/api/videos/${id}/view`);

export const likeVideo = (id) =>
  apiClient.post(`/api/videos/${id}/like`);

export const updateVideoTitle = (id, title) =>
  apiClient.patch(`/api/videos/${id}/title`, { title });

export const updateVideoDescription = (id, description) =>
  apiClient.patch(`/api/videos/${id}/description`, { description });

export const updateVideo = (id, { title, description }) =>
  apiClient.patch(`/api/videos/${id}`, { title, description });

export const deleteVideo = (id) => apiClient.delete(`/api/videos/${id}`);
