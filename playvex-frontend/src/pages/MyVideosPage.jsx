import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Plus, AlertCircle } from "lucide-react";
import { getMyVideos, deleteVideo } from "../api/videoService";
import VideoGrid from "../components/video/VideoGrid";
import EditVideoModal from "../components/video/EditVideoModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ErrorState from "../components/common/ErrorState";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/helpers";
import "./MyVideosPage.css";

const MyVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState(null);

  // Delete Dialog State
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const addToast = useToast();
  const navigate = useNavigate();

  const fetchMyVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyVideos();
      setVideos(response.data || []);
    } catch (err) {
      console.error("Fetch my-videos error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVideos();
  }, []);

  const handleEdit = (video) => {
    setEditingVideo(video);
  };

  const handleVideoUpdated = (updatedVideo) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === updatedVideo.id ? { ...v, ...updatedVideo } : v))
    );
  };

  const handleDeletePrompt = (video) => {
    setDeletingVideo(video);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    setDeleteLoading(true);

    try {
      await deleteVideo(deletingVideo.id);
      addToast("Video deleted successfully.", "success");
      setVideos((prev) => prev.filter((v) => v.id !== deletingVideo.id));
      setDeletingVideo(null);
    } catch (err) {
      console.error("Delete video error:", err);
      addToast(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="my-videos-page">
      <div className="my-videos__header">
        <div className="my-videos__title-group">
          <h1 className="my-videos__title">My Videos</h1>
          <p className="my-videos__subtitle">
            Manage your video library, edit descriptions, and monitor views
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/upload")}
        >
          <Plus size={16} />
          <span>Upload New Video</span>
        </button>
      </div>

      {error && !loading && (
        <ErrorState
          message={`Failed to load your videos: ${error}`}
          onRetry={fetchMyVideos}
        />
      )}

      {!error && (
        <div className="my-videos__content">
          <VideoGrid
            videos={videos}
            loading={loading}
            skeletonCount={4}
            emptyTitle="You haven't uploaded any videos yet"
            emptyMessage="Upload your first video to start building your PlayVex entertainment channel."
            emptyAction={() => navigate("/upload")}
            emptyActionLabel="Upload a Video"
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDeletePrompt}
          />
        </div>
      )}

      {/* Edit Video Modal */}
      <EditVideoModal
        isOpen={!!editingVideo}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onUpdated={handleVideoUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingVideo}
        title="Delete Video"
        message={`Are you sure you want to permanently delete "${deletingVideo?.title}"? This action cannot be reversed.`}
        confirmLabel="Delete Permanently"
        cancelLabel="Cancel"
        danger={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingVideo(null)}
      />
    </div>
  );
};

export default MyVideosPage;
