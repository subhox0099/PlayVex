import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import "./ErrorState.css";

const ErrorState = ({
  message = "Something went wrong.",
  onRetry,
}) => (
  <motion.div
    className="error-state"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="error-state__icon">
      <AlertCircle size={36} />
    </div>
    <h3 className="error-state__title">Oops!</h3>
    <p className="error-state__message">{message}</p>
    {onRetry && (
      <button className="btn btn-secondary" onClick={onRetry}>
        <RefreshCw size={16} /> Try Again
      </button>
    )}
  </motion.div>
);

export default ErrorState;
