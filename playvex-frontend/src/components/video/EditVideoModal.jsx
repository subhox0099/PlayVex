import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Edit2, Loader2 } from "lucide-react";
import { updateVideo } from "../../api/videoService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/helpers";
import "./EditVideoModal.css";

const EditVideoModal = ({ isOpen, video, onClose, onUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

  useEffect(() => {
    if (video) {
      setTitle(video.title || "");
      setDescription(video.description || "");
      setError(null);
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await updateVideo(video.id, {
        title: trimmedTitle,
        description: description.trim(),
      });
      addToast("Video updated successfully!", "success");
      onUpdated?.(res.data);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal-content card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-video-title"
        >
          <div className="modal-header">
            <div className="modal-header__title-group">
              <div className="modal-header__icon">
                <Edit2 size={18} />
              </div>
              <h2 id="edit-video-title" className="modal-header__title">
                Edit Video Details
              </h2>
            </div>
            <button
              className="btn btn-icon btn-ghost modal-close-btn"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {error && <div className="form-error-alert">{error}</div>}

            <div className="form-group">
              <label htmlFor="edit-title" className="form-label">
                Video Title <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                className={`form-input ${error && !title.trim() ? "error" : ""}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                disabled={loading}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-description" className="form-label">
                Description
              </label>
              <textarea
                id="edit-description"
                className="form-input form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about your video"
                disabled={loading}
                rows={4}
                maxLength={500}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !title.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditVideoModal;

