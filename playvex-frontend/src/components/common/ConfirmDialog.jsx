import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="dialog-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="dialog"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <button className="dialog__close" onClick={onCancel} aria-label="Close dialog">
            <X size={18} />
          </button>
          <div className={`dialog__icon ${danger ? "dialog__icon--danger" : ""}`}>
            <AlertTriangle size={28} />
          </div>
          <h2 id="dialog-title" className="dialog__title">{title}</h2>
          {message && <p className="dialog__message">{message}</p>}
          <div className="dialog__actions">
            <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </button>
            <button
              className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmDialog;
