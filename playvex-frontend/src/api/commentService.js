import apiClient from "./apiClient";

/**
 * Safe parser for Comments response from Spring Boot.
 * Handles both standard JSON arrays/objects and circular Jackson serialization.
 */
const parseCommentsResponse = (raw) => {
  if (!raw) return [];
  if (typeof raw === "object") {
    if (Array.isArray(raw)) {
      return raw.map((c) => ({
        id: c.id,
        author: c.author,
        comment: c.comment,
      }));
    }
    if (raw.id && raw.comment) {
      return [{ id: raw.id, author: raw.author, comment: raw.comment }];
    }
    return [];
  }

  if (typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((c) => ({
        id: c.id,
        author: c.author,
        comment: c.comment,
      }));
    }
    if (parsed.id && parsed.comment) {
      return [{ id: parsed.id, author: parsed.author, comment: parsed.comment }];
    }
  } catch {
    // Jackson circular recursion fallback parser
  }

  const comments = [];
  const seenIds = new Set();
  const regex =
    /"author"\s*:\s*"([^"]*)"\s*,\s*"comment"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"id"\s*:\s*(\d+)|"id"\s*:\s*(\d+)\s*,\s*"author"\s*:\s*"([^"]*)"\s*,\s*"comment"\s*:\s*"((?:\\.|[^"\\])*)"|"comment"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"author"\s*:\s*"([^"]*)"\s*,\s*"id"\s*:\s*(\d+)/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    let id, author, comment;
    if (match[3]) {
      author = match[1];
      comment = match[2];
      id = Number(match[3]);
    } else if (match[4]) {
      id = Number(match[4]);
      author = match[5];
      comment = match[6];
    } else if (match[9]) {
      comment = match[7];
      author = match[8];
      id = Number(match[9]);
    }
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      comments.push({
        id,
        author,
        comment: (comment || "").replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
      });
    }
  }

  return comments;
};

/**
 * Fetch all comments for a video.
 * GET /api/comments/video/{videoId}
 */
export const getCommentsByVideoId = (videoId) =>
  apiClient.get(`/api/comments/video/${videoId}`, {
    transformResponse: [parseCommentsResponse],
  });

/**
 * Add a comment to a video.
 * POST /api/comments/video/{videoId}
 * Body: { comment: string }
 */
export const addComment = (videoId, comment) =>
  apiClient.post(
    `/api/comments/video/${videoId}`,
    { comment },
    {
      transformResponse: [
        (raw) => {
          const parsed = parseCommentsResponse(raw);
          return parsed[0] || { success: true };
        },
      ],
    }
  );

/**
 * Delete a comment by ID.
 * DELETE /api/comments/{commentId}
 */
export const deleteComment = (commentId) =>
  apiClient.delete(`/api/comments/${commentId}`);

