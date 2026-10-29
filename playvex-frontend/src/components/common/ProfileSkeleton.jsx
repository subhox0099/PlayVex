import "./ProfileSkeleton.css";

const ProfileSkeleton = () => {
  return (
    <div className="profile-skeleton card" aria-hidden="true">
      <div className="profile-skeleton__header">
        <div className="profile-skeleton__avatar skeleton" />
        <div className="profile-skeleton__user-info">
          <div className="profile-skeleton__name skeleton" />
          <div className="profile-skeleton__email skeleton" />
          <div className="profile-skeleton__badge skeleton" />
        </div>
      </div>
      <div className="profile-skeleton__stats">
        <div className="profile-skeleton__stat-card skeleton" />
        <div className="profile-skeleton__stat-card skeleton" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;

