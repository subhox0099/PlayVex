import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Eye, EyeOff, Loader2, X } from "lucide-react";
import { deleteAccount } from "../../api/userService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import "./DeleteAccountModal.css";

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your current password to confirm.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteAccount(password);
      addToast("Account permanently deleted.", "info");
      logout();
      navigate("/");
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
          className="modal-content card delete-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="modal-header">
            <div className="modal-header__title-group">
              <div className="delete-modal__icon">
                <AlertTriangle size={20} />
              </div>
              <h2 id="delete-account-title" className="modal-header__title" style={{ color: "var(--color-error)" }}>
                Delete Account
              </h2>
            </div>
            <button
              className="btn btn-icon btn-ghost modal-close-btn"
              onClick={onClose}
              disabled={loading}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleDelete} className="modal-form">
            <div className="delete-modal__warning">
              <p>
                <strong>Warning:</strong> This action cannot be undone. All your uploaded videos,
                profile data, and account information will be permanently deleted.
              </p>
            </div>

            {error && <div className="form-error-alert">{error}</div>}

            <div className="form-group">
              <label htmlFor="delete-confirm-password" className="form-label">
                Enter your password to confirm:
              </label>
              <div className="input-wrapper">
                <input
                  id="delete-confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your account password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                className="btn btn-danger"
                disabled={loading || !password}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Permanently Delete My Account"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteAccountModal;

