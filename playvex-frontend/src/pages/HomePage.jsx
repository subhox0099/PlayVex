import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVideos } from "../api/videoService";
import VideoGrid from "../components/video/VideoGrid";
import CategoryChips from "../components/video/CategoryChips";
import ErrorState from "../components/common/ErrorState";
import { getErrorMessage } from "../utils/helpers";
import "./HomePage.css";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const navigate = useNavigate();

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllVideos();
      setVideos(response.data || []);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Filter and sort videos based on selected YouTube-style category chip
  const filteredVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    if (activeCategory === "All") {
      return videos;
    }

    if (activeCategory === "Recently Uploaded") {
      return [...videos].reverse();
    }

    if (activeCategory === "Popular") {
      return [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    // Category keyword matching
    const keyword = activeCategory.toLowerCase();
    const matched = videos.filter((v) => {
      const titleMatch = v.title?.toLowerCase().includes(keyword);
      const descMatch = v.description?.toLowerCase().includes(keyword);
      return titleMatch || descMatch;
    });

    // If no direct keyword match, fallback to showing all videos so the grid is never blank
    return matched.length > 0 ? matched : videos;
  }, [videos, activeCategory]);

  return (
    <div className="home-page-youtube">
      {/* YouTube-Style Category Filter Chips */}
      <CategoryChips
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          message={`Unable to load videos: ${error}`}
          onRetry={fetchVideos}
        />
      )}

      {/* Main YouTube Video Feed */}
      {!error && (
        <div className="home-feed">
          <VideoGrid
            videos={filteredVideos}
            loading={loading}
            skeletonCount={12}
            emptyTitle="No videos found"
            emptyMessage={
              activeCategory === "All"
                ? "No videos have been uploaded yet. Be the first to launch content into the PlayVex universe!"
                : `No videos found matching category "${activeCategory}".`
            }
            emptyAction={() => navigate("/upload")}
            emptyActionLabel="Upload Video"
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
