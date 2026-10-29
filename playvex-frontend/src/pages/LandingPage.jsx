import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Sparkles, Shield, Zap, Film, ArrowRight } from "lucide-react";
import PlayVexLogo from "../components/common/PlayVexLogo";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-nav__container">
          <Link to="/" aria-label="PlayVex home">
            <PlayVexLogo size="md" showTagline={false} />
          </Link>
          <div className="landing-nav__actions">
            {isAuthenticated ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/home")}
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__ambient" />
        <div className="landing-hero__container">
          <motion.div
            className="landing-hero__badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Sparkles size={14} className="landing-hero__badge-icon" />
            <span>Next-Gen Video Experience</span>
          </motion.div>

          <motion.h1
            className="landing-hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A Universe of <span className="text-crimson-gradient">Entertainment</span>
          </motion.h1>

          <motion.p
            className="landing-hero__tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Immerse yourself in high-definition video sharing. Stream your favorite content,
            showcase your creative voice, and connect with a vibrant entertainment ecosystem.
          </motion.p>

          <motion.div
            className="landing-hero__cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/home" className="btn btn-secondary btn-lg">
              <Play size={18} fill="currentColor" />
              <span>Explore Videos</span>
            </Link>
          </motion.div>

          {/* Cinematic CSS Artwork / Player Showcase */}
          <motion.div
            className="landing-hero__showcase"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="landing-showcase-window">
              <div className="landing-showcase-bar">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <div className="landing-showcase-tab">PlayVex Player • Cinema Mode</div>
              </div>
              <div className="landing-showcase-screen">
                <div className="landing-showcase-pattern">
                  <div className="showcase-glow" />
                  <PlayVexLogo size="lg" showTagline={true} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-features__container">
          <div className="section-header">
            <h2 className="section-title">Engineered for Creators and Viewers</h2>
            <p className="section-subtitle">
              Every detail built with purpose, performance, and aesthetic precision.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-card__icon-wrapper">
                <Film size={24} />
              </div>
              <h3 className="feature-card__title">High-Fidelity Playback</h3>
              <p className="feature-card__desc">
                Stream smooth HTML5 video with authenticated buffers and instant controls tailored for modern displays.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-card__icon-wrapper">
                <Zap size={24} />
              </div>
              <h3 className="feature-card__title">Fast Video Uploads</h3>
              <p className="feature-card__desc">
                Seamless drag-and-drop video uploads up to 100 MB with realtime upload progress tracking and validation.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-card__icon-wrapper">
                <Shield size={24} />
              </div>
              <h3 className="feature-card__title">Secure Authentication</h3>
              <p className="feature-card__desc">
                Protected user profiles, encrypted session authorization, and complete control over your content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__container">
          <div className="landing-footer__brand">
            <PlayVexLogo size="sm" showTagline={false} />
            <span className="landing-footer__copy">
              © {new Date().getFullYear()} PlayVex. A Universe of Entertainment. All rights reserved.
            </span>
          </div>
          <div className="landing-footer__links">
            <Link to="/home" className="footer-link">Discover</Link>
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/register" className="footer-link">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

