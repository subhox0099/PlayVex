import { getVideoBlob } from "../api/videoService";

// In-memory cache: videoId -> { url: string, promise: Promise<string> | null }
const blobMap = new Map();

/**
 * Get an existing Object URL for a video, or fetch its blob and create one.
 * Deduplicates in-flight requests.
 */
export const getVideoObjectUrl = async (videoId) => {
  if (!videoId) return null;

  // If already cached
  if (blobMap.has(videoId)) {
    const entry = blobMap.get(videoId);
    if (entry.url) return entry.url;
    if (entry.promise) return entry.promise;
  }

  // Fetch with request deduplication
  const fetchPromise = (async () => {
    try {
      const response = await getVideoBlob(videoId);
      const url = URL.createObjectURL(response.data);
      blobMap.set(videoId, { url, promise: null });
      return url;
    } catch (err) {
      console.warn(`Could not load video blob for #${videoId}:`, err.message);
      blobMap.delete(videoId);
      return null;
    }
  })();

  blobMap.set(videoId, { url: null, promise: fetchPromise });
  return fetchPromise;
};

/**
 * Check synchronously if an Object URL is already available in cache.
 */
export const getCachedVideoUrl = (videoId) => {
  if (!videoId) return null;
  return blobMap.get(videoId)?.url || null;
};

