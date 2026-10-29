/**
 * Format a number of bytes into a human-readable string.
 * e.g. 1048576 -> "1.0 MB"
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

/**
 * Format a view count with K/M abbreviations.
 * e.g. 1500 -> "1.5K"
 */
export const formatViews = (count) => {
  if (!count && count !== 0) return "0";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
};

/**
 * Format a LocalDateTime string from the backend into a readable date.
 * e.g. "2026-10-29T03:00:00" -> "Oct 29, 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/**
 * Extract a user-friendly error message from an Axios error.
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";
  const msg =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "An error occurred";
  return typeof msg === "string" ? msg : "An error occurred";
};

/**
 * Validate an email address.
 */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Truncate a string to a given length with ellipsis.
 */
export const truncate = (str, length = 60) => {
  if (!str) return "";
  return str.length > length ? `${str.slice(0, length)}…` : str;
};

/**
 * Check if a JWT token is expired.
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

/**
 * Format a date string into relative time ago (e.g. "2 hours ago", "3 days ago").
 */
export const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
};

/**
 * Format video duration in seconds to standard MM:SS or HH:MM:SS.
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "";
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
