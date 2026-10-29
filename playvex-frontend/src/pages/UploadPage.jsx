import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import UploadDropzone from "../components/video/UploadDropzone";
import { uploadVideo } from "../api/videoService";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/helpers";
import "./UploadPage.css";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const addToast = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    // Autofill title with file name without extension if title is empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleFileRemove = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file to upload.");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a video title.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    // Guarantee valid video/* MIME type so Spring Boot's startsWith("video/") check succeeds
    let uploadFile = file;
    if (!uploadFile.type || !uploadFile.type.toLowerCase().startsWith("video/")) {
      const ext = uploadFile.name.split(".").pop().toLowerCase();
      const mimeMap = {
        mp4: "video/mp4",
        webm: "video/webm",
        mkv: "video/x-matroska",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        flv: "video/x-flv",
      };
      uploadFile = new File([file], file.name, {
        type: mimeMap[ext] || "video/mp4",
      });
    }

    try {
      await uploadVideo(uploadFile, trimmedTitle, description.trim(), (pct) => {
        setProgress(pct);
      });

      addToast("Video uploaded successfully!", "success");
      navigate("/my-videos");
    } catch (err) {
      console.error("Upload error:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.response?.status === 403) {
        if (uploadFile.size > 31 * 1024 * 1024) {
          setError(
            `Upload rejected (403). Your file is ${formatFileSize(uploadFile.size)}. Videos over 31 MB exceed MySQL's default 64 MB packet limit (MySQL stores binary data in a LONGBLOB column which doubles transmission size). Please upload a video under 31 MB, or set '?maxAllowedPacket=268435456' on your backend JDBC URL.`
          );
        } else {
          setError(
            "Upload forbidden (403). Your session token may have expired or the video format is invalid. Please sign out and sign in again."
          );
        }
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-page__header">
        <h1 className="upload-page__title">Upload Video</h1>
        <p className="upload-page__subtitle">
          Share your video with the PlayVex community (Max size: 100 MB)
        </p>
      </div>

      <div className="upload-card card">
        <form onSubmit={handleSubmit} className="upload-form">
          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Dropzone */}
          <div className="form-group">
            <label className="form-label">Video File</label>
            <UploadDropzone
              file={file}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />
          </div>

          {/* Details */}
          <div className="form-group">
            <label htmlFor="upload-title" className="form-label">
              Video Title <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              id="upload-title"
              type="text"
              className="form-input"
              placeholder="e.g. My Amazing Creative Video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="upload-desc" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="upload-desc"
              className="form-input form-textarea"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={4}
              maxLength={500}
            />
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="upload-progress-container">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="upload-progress-text">
                <span>Uploading to server...</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="upload-form__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={uploading || !file || !title.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Uploading ({progress}%)...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Publish Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
