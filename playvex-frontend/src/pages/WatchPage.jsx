import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Eye, HardDrive, FileType, Calendar, Share2, ThumbsUp, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { getAllVideos, likeVideo } from "../api/videoService";
import VideoPlayer from "../components/video/VideoPlayer";
import VideoPlayerSkeleton from "../components/common/VideoPlayerSkeleton";
import VideoCard from "../components/video/VideoCard";
import CommentsSection from "../components/video/CommentsSection";
import ErrorState from "../components/common/ErrorState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatFileSize, formatViews, getErrorMessage } from "../utils/helpers";
import "./WatchPage.css";

const WatchPage = () => {
  const { id } = useParams();
  const videoId = Number(id);
  const navigate = useNavigate();
  const addToast = useToast();
  const { user, isAuthenticated } = useAuth();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const response = await getAllVideos();
        if (!isMounted) return;

        const all = response.data || [];
        const found = all.find((v) => Number(v.id) === videoId);

        if (!found) {
          setError(`Video #${videoId} could not be found.`);
          setLoading(false);
          return;
        }

        setCurrentVideo(found);
        setViewCount(found.views || 0);

        // Related videos: all except current video
        const others = all.filter((v) => Number(v.id) !== videoId);
        setRelatedVideos(others.slice(0, 8));
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err));
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  // Sync likes state
  useEffect(() => {
    const userKey = user?.id || "guest";
    const likedKey = `pv_liked_${userKey}_${videoId}`;
    const storedLiked = localStorage.getItem(likedKey) === "true";
    setHasLiked(storedLiked);

    const storedLikesCount = localStorage.getItem(`pv_likes_count_${videoId}`);
    if (storedLikesCount !== null) {
      setLikesCount(Number(storedLikesCount));
    } else {
      setLikesCount(currentVideo?.likes || 0);
    }
  }, [videoId, user, currentVideo]);

  const handleViewsIncremented = (newViews) => {
    setViewCount(newViews);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      addToast("Please sign in to like this video", "error");
      return;
    }
    if (liking) return;

    setLiking(true);
    const previousLiked = hasLiked;
    const previousCount = likesCount;
    const newLiked = !hasLiked;
    const newCount = newLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

    setHasLiked(newLiked);
    setLikesCount(newCount);

    const userKey = user?.id || "guest";
    localStorage.setItem(`pv_liked_${userKey}_${videoId}`, String(newLiked));
    localStorage.setItem(`pv_likes_count_${videoId}`, String(newCount));

    try {
      const res = await likeVideo(videoId);
      if (res.data) {
        const serverLikes = res.data.Likes ?? res.data.likes;
        if (serverLikes !== undefined) {
          setLikesCount(serverLikes);
          localStorage.setItem(`pv_likes_count_${videoId}`, String(serverLikes));
        }
      }
      if (newLiked) {
        addToast("Added to your liked videos!", "success");
      }
    } catch (err) {
      console.error("Failed to like video:", err);
      setHasLiked(previousLiked);
      setLikesCount(previousCount);
      localStorage.setItem(`pv_liked_${userKey}_${videoId}`, String(previousLiked));
      localStorage.setItem(`pv_likes_count_${videoId}`, String(previousCount));
      addToast(getErrorMessage(err) || "Could not update like", "error");
    } finally {
      setLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("Video link copied to clipboard!", "success");
    }
  };

  return (
    <div className="watch-page">
      <button
        className="btn btn-ghost btn-sm watch-page__back-btn"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {loading && <VideoPlayerSkeleton />}

      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && !error && currentVideo && (
        <div className="watch-layout">
          {/* Main Column */}
          <div className="watch-main">
            {/* Player */}
            <VideoPlayer
              videoId={videoId}
              title={currentVideo.title}
              onViewsIncremented={handleViewsIncremented}
            />

            {/* Video Details Card */}
            <div className="watch-info card">
              <h1 className="watch-info__title">{currentVideo.title}</h1>

              <div className="watch-info__meta-bar">
                <div className="watch-info__stats">
                  <span className="watch-stat">
                    <Eye size={16} />
                    <strong>{formatViews(viewCount)}</strong> views
                  </span>
                  {currentVideo.filesize && (
                    <span className="watch-stat">
                      <HardDrive size={16} />
                      {formatFileSize(currentVideo.filesize)}
                    </span>
                  )}
                  {currentVideo.contentType && (
                    <span className="watch-stat badge badge-primary">
                      {currentVideo.contentType}
                    </span>
                  )}
                </div>

                <div className="watch-info__actions">
                  <motion.button
                    className={`btn btn-sm ${hasLiked ? "btn-primary" : "btn-secondary"}`}
                    onClick={handleLike}
                    disabled={liking}
                    whileTap={{ scale: 0.92 }}
                    title={hasLiked ? "Liked" : "Like video"}
                    aria-label="Like video"
                  >
                    <Heart
                      size={16}
                      fill={hasLiked ? "currentColor" : "none"}
                    />
                    <span>{formatViews(likesCount)}</span>
                  </motion.button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleShare}
                    title="Share video"
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {currentVideo.description && (
                <div className="watch-info__description">
                  <h3 className="watch-info__desc-heading">Description</h3>
                  <p className="watch-info__desc-text">{currentVideo.description}</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <CommentsSection videoId={videoId} />
          </div>

          {/* Related Videos Column */}
          {relatedVideos.length > 0 && (
            <aside className="watch-sidebar">
              <h2 className="watch-sidebar__title">Related Videos</h2>
              <div className="watch-sidebar__list">
                {relatedVideos.map((item) => (
                  <div
                    key={item.id}
                    className="watch-sidebar__item card"
                    onClick={() => navigate(`/watch/${item.id}`)}
                  >
                    <div className="watch-sidebar__item-thumb">
                      <span className="watch-sidebar__item-badge">
                        {formatFileSize(item.filesize)}
                      </span>
                    </div>
                    <div className="watch-sidebar__item-info">
                      <h4 className="watch-sidebar__item-title truncate" title={item.title}>
                        {item.title}
                      </h4>
                      <p className="watch-sidebar__item-meta">
                        {formatViews(item.views)} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchPage;
