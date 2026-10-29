import { motion } from "framer-motion";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "../common/VideoCardSkeleton";
import EmptyState from "../common/EmptyState";
import { Film } from "lucide-react";
import "./VideoGrid.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const VideoGrid = ({
  videos = [],
  loading = false,
  skeletonCount = 8,
  emptyTitle = "No videos found",
  emptyMessage = "There are no videos available in this section yet.",
  emptyAction,
  emptyActionLabel,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="video-grid" aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        actionLabel={emptyActionLabel}
      />
    );
  }

  return (
    <motion.div
      className="video-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {videos.map((video) => (
        <motion.div key={video.id} variants={itemVariants}>
          <VideoCard
            video={video}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default VideoGrid;

