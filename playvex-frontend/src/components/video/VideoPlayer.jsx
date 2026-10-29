import { useState, useEffect, useRef } from "react";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { getVideoBlob, incrementViews } from "../../api/videoService";
import { getErrorMessage } from "../../utils/helpers";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoId, title, onViewsIncremented }) => {
  const [videoSrc, setVideoSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewCountedRef = useRef(false);
  const videoRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Fetch video as authenticated Blob
  useEffect(() => {
    let isMounted = true;
    viewCountedRef.current = false;
    setLoading(true);
    setError(null);

    // Clean up previous blob URL if any
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const loadVideo = async () => {
      try {
        const response = await getVideoBlob(videoId);
        if (!isMounted) return;

        const blob = response.data;
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setVideoSrc(url);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Playback load error:", err);
        setError(getErrorMessage(err));
        setLoading(false);
      }
    };

    if (videoId) {
      loadVideo();
    }

    return () => {
      isMounted = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [videoId]);

  // Handle play event — increment view count exactly once per playback session
  const handlePlay = async () => {
    if (!viewCountedRef.current && videoId) {
      viewCountedRef.current = true;
      try {
        const res = await incrementViews(videoId);
        if (onViewsIncremented && res.data?.views != null) {
          onViewsIncremented(res.data.views);
        }
      } catch (err) {
        console.warn("Could not increment views:", err);
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    viewCountedRef.current = false;
    getVideoBlob(videoId)
      .then((response) => {
        const url = URL.createObjectURL(response.data);
        objectUrlRef.current = url;
        setVideoSrc(url);
        setLoading(false);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setLoading(false);
      });
  };

  return (
    <div className="video-player-container">
      <div className="video-player-wrapper aspect-video">
        {loading && (
          <div className="video-player__overlay video-player__overlay--loading">
            <Loader2 className="spinner spinner--lg" />
            <p className="video-player__loading-text">
              Loading stream into memory...
            </p>
          </div>
        )}

        {error && (
          <div className="video-player__overlay video-player__overlay--error">
            <AlertCircle size={40} className="video-player__error-icon" />
            <p className="video-player__error-title">Unable to play video</p>
            <p className="video-player__error-desc">{error}</p>
            <button className="btn btn-secondary btn-sm" onClick={handleRetry}>
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {videoSrc && !error && (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            autoPlay
            playsInline
            className="video-player__element"
            onPlay={handlePlay}
            aria-label={title || "Video playback"}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="video-player__disclaimer">
        <span>💡 Streaming note: Video is streamed via authenticated memory buffer.</span>
      </div>
    </div>
  );
};

export default VideoPlayer;

