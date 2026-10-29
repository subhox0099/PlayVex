import "./VideoCardSkeleton.css";

const VideoCardSkeleton = () => {
  return (
    <div className="video-card-skeleton" aria-hidden="true">
      <div className="video-card-skeleton__thumbnail skeleton" />
      <div className="video-card-skeleton__details">
        <div className="video-card-skeleton__avatar skeleton" />
        <div className="video-card-skeleton__info">
          <div className="video-card-skeleton__title skeleton" />
          <div className="video-card-skeleton__meta skeleton" />
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;

