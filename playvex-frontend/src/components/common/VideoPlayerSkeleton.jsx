import "./VideoPlayerSkeleton.css";

const VideoPlayerSkeleton = () => {
  return (
    <div className="player-skeleton" aria-hidden="true">
      <div className="player-skeleton__screen skeleton" />
      <div className="player-skeleton__info">
        <div className="player-skeleton__title skeleton" />
        <div className="player-skeleton__meta skeleton" />
        <div className="player-skeleton__desc skeleton" />
      </div>
    </div>
  );
};

export default VideoPlayerSkeleton;

