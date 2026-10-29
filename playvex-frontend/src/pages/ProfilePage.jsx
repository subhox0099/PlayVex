import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Shield, Film, Settings, Edit3 } from "lucide-react";
import { getProfile } from "../api/userService";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import ProfileSkeleton from "../components/common/ProfileSkeleton";
import ErrorState from "../components/common/ErrorState";
import { getErrorMessage } from "../utils/helpers";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">User Profile</h1>
        <p className="profile-page__subtitle">Your PlayVex public profile and activity statistics</p>
      </div>

      {loading && <ProfileSkeleton />}

      {error && !loading && (
        <ErrorState
          message={`Failed to load profile details: ${error}`}
          onRetry={fetchProfile}
        />
      )}

      {!loading && !error && profile && (
        <div className="profile-card card">
          <div className="profile-card__top">
            <ProfileAvatar username={profile.username} size="lg" />
            <div className="profile-card__identity">
              <div className="profile-card__name-badge">
                <h2 className="profile-card__username">{profile.username}</h2>
                <span className="badge badge-primary">{profile.role || "USER"}</span>
              </div>
              <p className="profile-card__email">
                <Mail size={14} />
                <span>{profile.email}</span>
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm profile-card__edit-btn"
              onClick={() => navigate("/settings")}
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </div>

          <hr className="divider" />

          {/* Stats Grid */}
          <div className="profile-stats">
            <div className="profile-stat-box card-elevated">
              <div className="profile-stat-box__icon">
                <Film size={22} />
              </div>
              <div className="profile-stat-box__info">
                <span className="profile-stat-box__num">{profile.totalVideos ?? 0}</span>
                <span className="profile-stat-box__label">Videos Uploaded</span>
              </div>
            </div>

            <div className="profile-stat-box card-elevated">
              <div className="profile-stat-box__icon">
                <Shield size={22} />
              </div>
              <div className="profile-stat-box__info">
                <span className="profile-stat-box__num">{profile.role || "Standard"}</span>
                <span className="profile-stat-box__label">Account Tier</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="profile-shortcuts">
            <Link to="/my-videos" className="btn btn-secondary">
              <Film size={16} />
              <span>View My Videos</span>
            </Link>
            <Link to="/upload" className="btn btn-primary">
              <span>Upload Video</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
