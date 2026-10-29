import { User } from "lucide-react";
import "./ProfileAvatar.css";

/**
 * ProfileAvatar — shows first letter of username as fallback.
 * The backend returns a file-system path for profilePicture which
 * is not publicly served, so we always display the letter fallback
 * unless a valid image URL is provided.
 */
const ProfileAvatar = ({ username = "", size = "md", className = "" }) => {
  const letter = (username || "?").charAt(0).toUpperCase();
  const colors = [
    "#FF3B5C", "#6366F1", "#10B981", "#F59E0B",
    "#3B82F6", "#8B5CF6", "#EC4899",
  ];
  const colorIndex =
    username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const bg = colors[colorIndex];

  return (
    <div
      className={`profile-avatar profile-avatar--${size} ${className}`}
      style={{ background: bg }}
      aria-label={`${username}'s avatar`}
    >
      <span className="profile-avatar__letter">{letter}</span>
    </div>
  );
};

export default ProfileAvatar;
