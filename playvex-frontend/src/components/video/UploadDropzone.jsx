import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileVideo, X, AlertCircle } from "lucide-react";
import { formatFileSize } from "../../utils/helpers";
import "./UploadDropzone.css";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const UploadDropzone = ({ file, onFileSelect, onFileRemove }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const validateAndSelect = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const isVideoMime =
      selectedFile.type && selectedFile.type.toLowerCase().startsWith("video/");
    const hasVideoExt =
      /\.(mp4|webm|mkv|mov|avi|flv|wmv|m4v)$/i.test(selectedFile.name);

    if (!isVideoMime && !hasVideoExt) {
      setError("Please select a valid video file (.mp4, .webm, .mkv, .mov).");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 100 MB limit (${formatFileSize(selectedFile.size)}).`);
      return;
    }

    // Ensure the File has a valid video/* MIME type so Spring Boot's startsWith("video/") check succeeds
    let normalizedFile = selectedFile;
    if (!isVideoMime) {
      const ext = selectedFile.name.split(".").pop().toLowerCase();
      const mimeMap = {
        mp4: "video/mp4",
        webm: "video/webm",
        mkv: "video/x-matroska",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        flv: "video/x-flv",
      };
      normalizedFile = new File([selectedFile], selectedFile.name, {
        type: mimeMap[ext] || "video/mp4",
      });
    }

    onFileSelect(normalizedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileRemove();
  };

  return (
    <div className="upload-dropzone-container">
      {!file ? (
        <div
          className={`upload-dropzone ${isDragOver ? "upload-dropzone--drag-over" : ""} ${
            error ? "upload-dropzone--error" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          aria-label="Upload video file drag and drop zone"
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleChange}
            accept="video/*"
            className="visually-hidden"
          />
          <div className="upload-dropzone__icon-wrapper">
            <UploadCloud size={44} className="upload-dropzone__icon" />
          </div>
          <div className="upload-dropzone__content">
            <p className="upload-dropzone__title">
              Click to select or drag & drop video
            </p>
            <p className="upload-dropzone__subtitle">
              MP4, WebM, MKV or MOV up to 100 MB
            </p>
          </div>
        </div>
      ) : (
        <div className="upload-dropzone__selected card">
          <div className="upload-dropzone__preview-wrapper aspect-video">
            {previewUrl && (
              <video
                src={previewUrl}
                controls
                className="upload-dropzone__preview-video"
              />
            )}
          </div>
          <div className="upload-dropzone__file-details">
            <div className="upload-dropzone__file-info">
              <FileVideo size={20} className="upload-dropzone__file-icon" />
              <div className="upload-dropzone__file-text">
                <p className="upload-dropzone__file-name truncate">{file.name}</p>
                <p className="upload-dropzone__file-size">
                  {formatFileSize(file.size)} • {file.type || "Video"}
                  {file.size > 31 * 1024 * 1024 && (
                    <span style={{ display: "block", color: "#f59e0b", fontSize: "0.75rem", marginTop: "2px" }}>
                      ⚠️ File &gt; 31 MB: Requires MySQL maxAllowedPacket &gt; 64 MB
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRemove}
              aria-label="Remove selected video"
            >
              <X size={16} />
              <span>Change Video</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-dropzone__error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;

