import { motion, AnimatePresence } from "framer-motion";
import "./EmptyState.css";

const EmptyState = ({
  icon: Icon,
  title = "Nothing here yet",
  message = "",
  action,
  actionLabel,
}) => (
  <motion.div
    className="empty-state"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {Icon && (
      <div className="empty-state__icon">
        <Icon size={40} strokeWidth={1.5} />
      </div>
    )}
    <h3 className="empty-state__title">{title}</h3>
    {message && <p className="empty-state__message">{message}</p>}
    {action && actionLabel && (
      <button className="btn btn-primary" onClick={action}>
        {actionLabel}
      </button>
    )}
  </motion.div>
);

export default EmptyState;
