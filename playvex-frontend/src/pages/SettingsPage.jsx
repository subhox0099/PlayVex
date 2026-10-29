import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Camera,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getProfile,
  updateName,
  updateEmail,
  changePassword,
  updateProfilePicture,
} from "../api/userService";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import DeleteAccountModal from "../components/profile/DeleteAccountModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isValidEmail, getErrorMessage } from "../utils/helpers";
import "./SettingsPage.css";

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  // Profile data
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Section 1: Username
  const [username, setUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState(null);

  // Section 2: Email
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);

  // Section 3: Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Section 4: Profile Picture
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [savingPicture, setSavingPicture] = useState(false);
  const [pictureError, setPictureError] = useState(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  // Handle Username update
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setUsernameError(null);
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      return;
    }

    setSavingUsername(true);
    try {
      const res = await updateName(trimmed);
      updateUser({ username: res.data.username });
      setProfile((prev) => ({ ...prev, username: res.data.username }));
      addToast("Username updated successfully!", "success");
    } catch (err) {
      setUsernameError(getErrorMessage(err));
    } finally {
      setSavingUsername(false);
    }
  };

  // Handle Email update
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError(null);
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setSavingEmail(true);
    try {
      const res = await updateEmail(trimmed);
      updateUser({ email: res.data.email });
      setProfile((prev) => ({ ...prev, email: res.data.email }));
      addToast(
        "Email updated successfully! As your email is your authentication identity, please re-login if prompted.",
        "success"
      );
    } catch (err) {
      setEmailError(getErrorMessage(err));
    } finally {
      setSavingEmail(false);
    }
  };

  // Handle Password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      addToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Profile Picture
  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPictureError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    setPictureFile(file);
    setPictureError(null);
    const url = URL.createObjectURL(file);
    setPicturePreview(url);
  };

  const handleUploadPicture = async () => {
    if (!pictureFile) return;
    setSavingPicture(true);
    setPictureError(null);

    try {
      const res = await updateProfilePicture(pictureFile);
      setProfile((prev) => ({ ...prev, ...res.data }));
      addToast("Profile picture updated successfully!", "success");
      setPictureFile(null);
    } catch (err) {
      setPictureError(getErrorMessage(err));
    } finally {
      setSavingPicture(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">Account Settings</h1>
        <p className="settings-page__subtitle">
          Manage your account profile, credentials, and security preferences
        </p>
      </div>

      <div className="settings-sections">
        {/* Profile Picture Card */}
        <section className="settings-card card">
          <div className="settings-card__header">
            <Camera size={20} className="settings-card__icon" />
            <h2 className="settings-card__title">Profile Picture</h2>
          </div>
          <div className="settings-avatar-wrapper">
            {picturePreview ? (
              <img
                src={picturePreview}
                alt="Preview"
                className="settings-avatar-preview"
              />
            ) : (
              <ProfileAvatar username={username || user?.username} size="lg" />
            )}
            <div className="settings-avatar-actions">
              <label htmlFor="avatar-input" className="btn btn-secondary btn-sm">
                <span>Choose Image</span>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="visually-hidden"
                  disabled={savingPicture}
                />
              </label>
              {pictureFile && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleUploadPicture}
                  disabled={savingPicture}
                >
                  {savingPicture ? <Loader2 size={14} className="spinner" /> : <Check size={14} />}
                  <span>Save Picture</span>
                </button>
              )}
            </div>
          </div>
          {pictureError && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={14} />
              <span>{pictureError}</span>
            </div>
          )}
        </section>

        {/* Username Card */}
        <section className="settings-card card">
          <div className="settings-card__header">
            <User size={20} className="settings-card__icon" />
            <h2 className="settings-card__title">Display Name</h2>
          </div>
          <form onSubmit={handleUpdateUsername} className="settings-form">
            {usernameError && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={14} />
                <span>{usernameError}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="settings-username" className="form-label">
                Username
              </label>
              <input
                id="settings-username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={savingUsername}
                required
              />
            </div>
            <div className="settings-card__actions">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={savingUsername || !username.trim() || username === profile?.username}
              >
                {savingUsername ? <Loader2 size={14} className="spinner" /> : "Update Username"}
              </button>
            </div>
          </form>
        </section>

        {/* Email Card */}
        <section className="settings-card card">
          <div className="settings-card__header">
            <Mail size={20} className="settings-card__icon" />
            <h2 className="settings-card__title">Email Address</h2>
          </div>
          <form onSubmit={handleUpdateEmail} className="settings-form">
            {emailError && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={14} />
                <span>{emailError}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="settings-email" className="form-label">
                Email
              </label>
              <input
                id="settings-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={savingEmail}
                required
              />
            </div>
            <p className="settings-note">
              Note: Changing your email modifies the primary login handle and JWT subject.
            </p>
            <div className="settings-card__actions">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={savingEmail || !email.trim() || email === profile?.email}
              >
                {savingEmail ? <Loader2 size={14} className="spinner" /> : "Update Email"}
              </button>
            </div>
          </form>
        </section>

        {/* Change Password Card */}
        <section className="settings-card card">
          <div className="settings-card__header">
            <Lock size={20} className="settings-card__icon" />
            <h2 className="settings-card__title">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="settings-form">
            {passwordError && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="settings-current-pw" className="form-label">
                Current Password
              </label>
              <div className="input-wrapper">
                <input
                  id="settings-current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={savingPassword}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-new-pw" className="form-label">
                New Password (minimum 6 characters)
              </label>
              <div className="input-wrapper">
                <input
                  id="settings-new-pw"
                  type={showNewPw ? "text" : "password"}
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={savingPassword}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowNewPw((v) => !v)}
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-confirm-pw" className="form-label">
                Confirm New Password
              </label>
              <input
                id="settings-confirm-pw"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={savingPassword}
                required
              />
            </div>

            <div className="settings-card__actions">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={savingPassword || !currentPassword || !newPassword}
              >
                {savingPassword ? <Loader2 size={14} className="spinner" /> : "Save New Password"}
              </button>
            </div>
          </form>
        </section>

        {/* Danger Zone: Delete Account */}
        <section className="settings-card settings-card--danger card">
          <div className="settings-card__header">
            <AlertTriangle size={20} className="settings-card__icon--danger" />
            <h2 className="settings-card__title" style={{ color: "var(--color-error)" }}>
              Danger Zone
            </h2>
          </div>
          <p className="settings-danger-text">
            Permanently delete your PlayVex account and all associated video data. Once deleted,
            your data cannot be recovered.
          </p>
          <div className="settings-card__actions">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete My Account
            </button>
          </div>
        </section>
      </div>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
