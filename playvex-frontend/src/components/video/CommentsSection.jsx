import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  LogIn,
  AlertCircle,
} from "lucide-react";
import {
  getCommentsByVideoId,
  addComment,
  deleteComment,
} from "../../api/commentService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../common/ConfirmDialog";
import { getErrorMessage } from "../../utils/helpers";
import "./CommentsSection.css";

const CommentsSection = ({ videoId }) => {
  const { user, isAuthenticated } = useAuth();
  const addToast = useToast();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!videoId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getCommentsByVideoId(videoId);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Unable to load comments at this time.");
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle new comment submit
  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text) return;

    if (!isAuthenticated) {
      addToast("Please sign in to leave a comment", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addComment(videoId, text);
      const created = res.data;

      // Optimistically or accurately add the new comment
      const newComment = {
        id: created.id || Date.now(),
        author: created.author || user?.username || user?.email || "You",
        comment: text,
      };

      setComments((prev) => [newComment, ...prev]);
      setNewCommentText("");
      addToast("Comment posted!", "success");
    } catch (err) {
      console.error("Failed to post comment:", err);
      addToast(getErrorMessage(err) || "Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment delete confirm
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    const commentId = commentToDelete.id;
    setDeletingId(commentId);

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      addToast("Comment deleted", "success");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      addToast(getErrorMessage(err) || "Failed to delete comment", "error");
    } finally {
      setDeletingId(null);
      setCommentToDelete(null);
    }
  };

  // Helper to determine if current user owns the comment
  const isCommentOwner = (comment) => {
    if (!user || !comment) return false;
    const author = (comment.author || "").toLowerCase();
    const currentUsername = (user.username || "").toLowerCase();
    const currentEmail = (user.email || "").toLowerCase();
    return author === currentUsername || author === currentEmail;
  };

  // Generate deterministic color for author avatar
  const getAvatarColor = (name) => {
    if (!name) return "#FF3B5C";
    const colors = [
      "#FF3B5C",
      "#8B5CF6",
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EC4899",
      "#06B6D4",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const clean = name.includes("@") ? name.split("@")[0] : name;
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="comments-section card">
      {/* Header */}
      <div className="comments-section__header">
        <div className="comments-section__title-group">
          <MessageSquare size={20} className="comments-section__icon" />
          <h2 className="comments-section__title">
            Comments{" "}
            <span className="comments-section__count">({comments.length})</span>
          </h2>
        </div>
      </div>

      {/* Comment Form (or Sign In banner) */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="comment-form">
          <div
            className="comment-form__avatar"
            style={{ backgroundColor: getAvatarColor(user?.username) }}
          >
            {getInitials(user?.username || user?.email)}
          </div>
          <div className="comment-form__input-wrapper">
            <textarea
              className="comment-form__textarea"
              placeholder="Add a comment to the universe..."
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={submitting}
              maxLength={1000}
            />
            <div className="comment-form__footer">
              <span className="comment-form__counter">
                {newCommentText.length}/1000
              </span>
              <div className="comment-form__actions">
                {newCommentText.trim() && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setNewCommentText("")}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!newCommentText.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="spinner" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-auth-banner">
          <div className="comment-auth-banner__content">
            <LogIn size={20} className="comment-auth-banner__icon" />
            <div>
              <p className="comment-auth-banner__title">
                Sign in to join the conversation
              </p>
              <p className="comment-auth-banner__subtitle">
                Share your feedback, connect with creators, and explore the universe.
              </p>
            </div>
          </div>
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="comments-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={fetchComments}
          >
            Retry
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-skeleton-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="comment-skeleton">
                <div className="skeleton comment-skeleton__avatar" />
                <div className="comment-skeleton__body">
                  <div
                    className="skeleton"
                    style={{ width: "120px", height: "14px", marginBottom: "8px" }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: "85%", height: "12px", marginBottom: "4px" }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: "50%", height: "12px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            <MessageSquare size={36} className="comments-empty__icon" />
            <p className="comments-empty__title">No comments yet</p>
            <p className="comments-empty__subtitle">
              Be the first to share your thoughts on this video!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((item) => (
              <motion.div
                key={item.id}
                className="comment-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="comment-item__avatar"
                  style={{ backgroundColor: getAvatarColor(item.author) }}
                >
                  {getInitials(item.author)}
                </div>
                <div className="comment-item__content">
                  <div className="comment-item__header">
                    <span className="comment-item__author">
                      {item.author.includes("@")
                        ? item.author.split("@")[0]
                        : item.author}
                    </span>
                    {isCommentOwner(item) && (
                      <span className="comment-item__badge">You</span>
                    )}
                  </div>
                  <p className="comment-item__text">{item.comment}</p>
                </div>

                {isCommentOwner(item) && (
                  <button
                    type="button"
                    className="comment-item__delete-btn"
                    title="Delete comment"
                    onClick={() => setCommentToDelete(item)}
                    disabled={deletingId === item.id}
                    aria-label="Delete comment"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={14} className="spinner" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!commentToDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
};

export default CommentsSection;

