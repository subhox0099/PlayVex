import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Eye,
  MoreVertical,
  Share2,
  Copy,
  Edit3,
  Trash2,
  VolumeX,
} from "lucide-react";
import { formatFileSize, formatViews, formatTimeAgo, formatDuration } from "../../utils/helpers";
import { getVideoObjectUrl, getCachedVideoUrl } from "../../utils/blobCache";
import { useToast } from "../../context/ToastContext";
import "./VideoCard.css";

const VideoCard = ({
  video,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [videoSrc, setVideoSrc] = useState(() => getCachedVideoUrl(video?.id));
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [duration, setDuration] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const menuRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Lazy load video blob when card is in viewport
  useEffect(() => {
    if (!video?.id || videoSrc) return;

    let observer;
    if ("IntersectionObserver" in window && cardRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            getVideoObjectUrl(video.id).then((url) => {
              if (url) setVideoSrc(url);
            });
            observer.disconnect();
          }
        },
        { rootMargin: "200px" }
      );
      observer.observe(cardRef.current);
    } else {
      // Fallback
      getVideoObjectUrl(video.id).then((url) => {
        if (url) setVideoSrc(url);
      });
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [video?.id, videoSrc]);

  // Set initial seek to 0.5s to generate realistic thumbnail frame
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      if (d && !isNaN(d) && d > 0) {
        setDuration(d);
      }
      try {
        videoRef.current.currentTime = Math.min(0.5, d > 1 ? 0.5 : 0);
      } catch {
        // ignore seek err on unbuffered
      }
    }
  };

  // Hover video preview playback
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Debounce slightly (200ms) to avoid triggering when quickly scrolling past
    hoverTimerRef.current = setTimeout(async () => {
      let src = videoSrc;
      if (!src) {
        src = await getVideoObjectUrl(video.id);
        if (src) setVideoSrc(src);
      }

      if (videoRef.current && src) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlayingPreview(true);
            })
            .catch(() => {
              // Autoplay policy or unmounted
            });
        }
      }
    }, 250);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      try {
        videoRef.current.currentTime = 0.5;
      } catch {
        // ignore
      }
    }
    setIsPlayingPreview(false);
    setPreviewProgress(0);
    setMenuOpen(false);
  };

  // Track preview progress
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setPreviewProgress(pct);
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [menuOpen]);

  const handleCardClick = (e) => {
    // If clicking menu button or dropdown item, prevent navigation
    if (e.target.closest(".video-card__menu-wrapper") || e.target.closest(".video-card__actions")) {
      return;
    }
    navigate(`/watch/${video.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/watch/${video.id}`);
    }
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const url = `${window.location.origin}/watch/${video.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast("Video link copied to clipboard!", "success");
    }
  };

  if (!video) return null;

  // Author details
  const authorName = video.user?.username || video.user?.email || "PlayVex Creator";
  const authorInitial = authorName.slice(0, 1).toUpperCase();

  // Pseudo-random deterministic gradient based on video id
  const hue = ((video.id || 1) * 67) % 360;

  return (
    <article
      ref={cardRef}
      className={`video-card ${isPlayingPreview ? "video-card--previewing" : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="button"
      aria-label={`Watch ${video.title || "video"}`}
    >
      {/* ── 16:9 Thumbnail / Video Preview Container ── */}
      <div className="video-card__thumbnail-container">
        {/* Real Video Preview element */}
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="video-card__video-element"
            muted
            playsInline
            loop
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          /* Sleek animated poster while loading */
          <div
            className="video-card__poster-fallback"
            style={{
              background: `radial-gradient(circle at 60% 40%, hsl(${hue}, 45%, 16%) 0%, #101016 90%)`,
            }}
          >
            <div className="video-card__poster-play">
              <Play size={24} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Hover preview indicator: Audio Muted pill */}
        {isPlayingPreview && (
          <div className="video-card__preview-badge">
            <VolumeX size={12} />
            <span>Previewing</span>
          </div>
        )}

        {/* Dynamic Crimson Progress Bar when playing preview */}
        {isPlayingPreview && (
          <div className="video-card__progress-track">
            <div
              className="video-card__progress-fill"
              style={{ width: `${previewProgress}%` }}
            />
          </div>
        )}

        {/* Bottom Right Duration / Size Badge */}
        <div className="video-card__badges">
          {duration ? (
            <span className="video-card__badge-duration">
              {formatDuration(duration)}
            </span>
          ) : video.filesize ? (
            <span className="video-card__badge-duration">
              {formatFileSize(video.filesize)}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── YouTube-Style Meta Details (Below Thumbnail) ── */}
      <div className="video-card__details">
        {/* Channel Avatar */}
        <div
          className="video-card__channel-avatar"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 45) % 360}, 75%, 45%))`,
          }}
          title={authorName}
        >
          {authorInitial}
        </div>

        {/* Video Info Column */}
        <div className="video-card__meta-content">
          <h3 className="video-card__title" title={video.title}>
            {video.title || "Untitled Video"}
          </h3>

          <p className="video-card__channel-name" title={authorName}>
            {authorName}
          </p>

          <div className="video-card__stats-row">
            <span>{formatViews(video.views)} views</span>
            <span className="video-card__dot">•</span>
            <span>{formatTimeAgo(video.uploadedAt) || "Recently"}</span>
          </div>
        </div>

        {/* 3-Dots Context Menu Button */}
        <div className="video-card__menu-wrapper" ref={menuRef}>
          <button
            type="button"
            className="video-card__menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            aria-label="More actions"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="video-card__dropdown-menu card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="video-card__dropdown-item"
                onClick={handleCopyLink}
              >
                <Copy size={14} />
                <span>Copy video link</span>
              </button>
              {showActions && (
                <>
                  <button
                    type="button"
                    className="video-card__dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit?.(video);
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Edit video</span>
                  </button>
                  <button
                    type="button"
                    className="video-card__dropdown-item video-card__dropdown-item--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete?.(video);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete video</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default VideoCard;
