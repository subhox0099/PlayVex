import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, Loader2, AlertCircle } from "lucide-react";
import PlayVexLogo from "../components/common/PlayVexLogo";
import { register as registerApi } from "../api/authService";
import { useToast } from "../context/ToastContext";
import { isValidEmail, getErrorMessage } from "../utils/helpers";
import "./AuthPages.css";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerApi({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });

      addToast("Account created successfully! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
            "This username or email is already registered in the system. Please sign in or use different details."
        );
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__ambient" />

      <header className="auth-page__nav">
        <Link to="/" aria-label="PlayVex home">
          <PlayVexLogo size="md" />
        </Link>
      </header>

      <main className="auth-page__container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="auth-card__header">
            <h1 className="auth-card__title">Create Account</h1>
            <p className="auth-card__subtitle">Join the universe of entertainment today</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="reg-username" className="form-label">
                Username
              </label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" aria-hidden="true" />
                <input
                  id="reg-username"
                  type="text"
                  className="form-input input-with-icon"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  className="form-input input-with-icon"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" aria-hidden="true" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input input-with-icon"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
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

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: "var(--space-2)" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-card__footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RegisterPage;
