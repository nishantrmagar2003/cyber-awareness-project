import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import "../../styles/videos.css";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return "-";

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`sav-summary-card sav-summary-card--${tone}`}>
      <p className="sav-summary-card__label">{label}</p>
      <h3 className="sav-summary-card__value">{value}</h3>
      <p className="sav-summary-card__note">{note}</p>
    </div>
  );
}

function VideoCard({ item, onDelete }) {
  return (
    <div className="sav-video-card">
      <div className="sav-video-card__top">
        <div className="sav-video-card__main">
          <div className="sav-video-card__header">
            <h4 className="sav-video-card__title">
              {item.title || "Untitled Video"}
            </h4>
            <span className="sav-video-badge">Uploaded</span>
          </div>

          <p className="sav-video-card__topic">
            Topic: <strong>{item.topic_title || "-"}</strong>
          </p>

          <div className="sav-video-card__meta">
            <span>Created: {formatDate(item.created_at)}</span>
            <span>Size: {formatBytes(item.file_size)}</span>
            <span>Video ID: {item.id}</span>
          </div>

          {item.video_url && (
            <p className="sav-video-card__url">
              File: <span>{item.video_url}</span>
            </p>
          )}
        </div>

        <div className="sav-video-card__actions">
          {item.video_url && (
            <a
              href={item.video_url}
              target="_blank"
              rel="noreferrer"
              className="sav-action-btn sav-action-btn--view"
            >
              View
            </a>
          )}

          <button
            type="button"
            onClick={() => onDelete(item)}
            className="sav-action-btn sav-action-btn--delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function TopicVideoBlock({ module, topic, videos, onDelete }) {
  return (
    <div className="sav-topic-block">
      <div className="sav-topic-block__header">
        <div>
          <div className="sav-topic-block__title-row">
            <h3 className="sav-topic-block__title">{topic.title}</h3>
            <span className="sav-module-badge">{module.title}</span>
          </div>

          <p className="sav-topic-block__description">
            {topic.description || "No topic description"}
          </p>

          <div className="sav-topic-block__meta">
            <span>Topic ID: {topic.id}</span>
            <span>Module ID: {module.id}</span>
            <span>Videos: {videos.length}</span>
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="sav-empty-box">
          <p className="sav-empty-box__title">No uploaded video yet</p>
          <p className="sav-empty-box__text">
            Upload a training video for this premium topic.
          </p>
        </div>
      ) : (
        <div className="sav-video-list">
          {videos.map((video) => (
            <VideoCard key={video.id} item={video} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Videos() {
  const [premiumModules, setPremiumModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Premium Modules");

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const premiumRes = await api.get("/modules/premium");
      const premiumRows = Array.isArray(premiumRes?.data?.data)
        ? premiumRes.data.data
        : [];

      setPremiumModules(premiumRows);

      const topicResponses = await Promise.all(
        premiumRows.map(async (module) => {
          try {
            const res = await api.get(`/topics/module/${module.id}`);
            const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

            return rows.map((topic) => ({
              ...topic,
              module_id: module.id,
              module_title: module.title,
              module_description: module.description || "",
              module_level: module.level || "basic",
            }));
          } catch (err) {
            console.error(`Failed to load topics for module ${module.id}:`, err);
            return [];
          }
        })
      );

      const allTopics = topicResponses.flat();
      setTopics(allTopics);

      const videoResponses = await Promise.all(
        allTopics.map(async (topic) => {
          try {
            const res = await api.get(`/videos/topic/${topic.id}`);
            const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

            return rows.map((video) => ({
              ...video,
              topic_id: topic.id,
              topic_title: topic.title,
              module_id: topic.module_id,
              module_title: topic.module_title,
            }));
          } catch (err) {
            console.error(`Failed to load videos for topic ${topic.id}:`, err);
            return [];
          }
        })
      );

      setVideos(videoResponses.flat());
    } catch (error) {
      console.error("Load videos page error:", error);
      setPremiumModules([]);
      setTopics([]);
      setVideos([]);
      setErrorMessage(
        error?.response?.data?.error || "Failed to load premium videos"
      );
    } finally {
      setLoading(false);
    }
  }

  function clearUploadForm() {
    setSelectedModuleId("");
    setSelectedTopicId("");
    setVideoTitle("");
    setSelectedFile(null);

    const fileInput = document.getElementById("premium-video-file-input");
    if (fileInput) {
      fileInput.value = "";
    }
  }

  function clearFilters() {
    setSearch("");
    setModuleFilter("All Premium Modules");
  }

  const filteredTopicsForUpload = useMemo(() => {
    if (!selectedModuleId) return [];
    return topics.filter(
      (topic) => String(topic.module_id) === String(selectedModuleId)
    );
  }, [topics, selectedModuleId]);

  async function handleUploadVideo() {
    try {
      setUploading(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!selectedModuleId) {
        setErrorMessage("Please select a premium module.");
        return;
      }

      if (!selectedTopicId) {
        setErrorMessage("Please select a premium topic.");
        return;
      }

      if (!selectedFile) {
        setErrorMessage("Please choose a video file from your computer.");
        return;
      }

      const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
      ];

      if (selectedFile.type && !allowedTypes.includes(selectedFile.type)) {
        setErrorMessage(
          "Only video files are allowed (mp4, webm, mov, avi, mkv)."
        );
        return;
      }

      const formData = new FormData();
      formData.append("topic_id", selectedTopicId);
      formData.append("title", videoTitle.trim() || selectedFile.name);
      formData.append("video", selectedFile);

      await api.post("/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Video uploaded successfully.");
      clearUploadForm();
      await fetchData();
    } catch (error) {
      console.error("Upload video error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to upload video"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteVideo(video) {
    const confirmed = window.confirm(
      `Delete video "${video.title || "Untitled Video"}"?`
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/videos/topic/${video.topic_id}`);

      setSuccessMessage("Video deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Delete video error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to delete video"
      );
    }
  }

  const filteredBlocks = useMemo(() => {
    const term = search.toLowerCase().trim();

    return premiumModules
      .filter((module) => {
        if (moduleFilter === "All Premium Modules") return true;
        return String(module.id) === String(moduleFilter);
      })
      .map((module) => {
        const moduleTopics = topics.filter(
          (topic) => Number(topic.module_id) === Number(module.id)
        );

        const moduleMatches =
          module.title?.toLowerCase().includes(term) ||
          module.description?.toLowerCase().includes(term);

        const topicBlocks = moduleTopics
          .map((topic) => {
            const topicVideos = videos.filter(
              (video) => Number(video.topic_id) === Number(topic.id)
            );

            const topicMatches =
              topic.title?.toLowerCase().includes(term) ||
              topic.description?.toLowerCase().includes(term);

            const filteredVideos = topicVideos.filter((video) => {
              return (
                video.title?.toLowerCase().includes(term) ||
                video.topic_title?.toLowerCase().includes(term) ||
                video.module_title?.toLowerCase().includes(term)
              );
            });

            if (!term) {
              return { topic, videos: topicVideos };
            }

            if (moduleMatches || topicMatches) {
              return { topic, videos: topicVideos };
            }

            if (filteredVideos.length > 0) {
              return { topic, videos: filteredVideos };
            }

            return null;
          })
          .filter(Boolean);

        if (!term) {
          return {
            module,
            topics: topicBlocks,
          };
        }

        if (moduleMatches || topicBlocks.length > 0) {
          return {
            module,
            topics: topicBlocks,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [premiumModules, topics, videos, search, moduleFilter]);

  const totalPremiumModules = premiumModules.length;
  const totalPremiumTopics = topics.length;
  const totalVideos = videos.length;
  const topicsWithVideos = topics.filter((topic) =>
    videos.some((video) => Number(video.topic_id) === Number(topic.id))
  ).length;

  return (
    <div className="sav-page">
      <PageHeader
        title="Videos Management"
        subtitle="Upload and manage training videos for premium topics only."
      />

      {errorMessage && <div className="sav-alert sav-alert--error">{errorMessage}</div>}

      {successMessage && (
        <div className="sav-alert sav-alert--success">{successMessage}</div>
      )}

      <div className="sav-summary-grid">
        <SummaryCard
          label="Premium Modules"
          value={loading ? "..." : totalPremiumModules}
          note="Premium modules available for video assignment."
          tone="blue"
        />
        <SummaryCard
          label="Premium Topics"
          value={loading ? "..." : totalPremiumTopics}
          note="Premium topics available for video upload."
          tone="indigo"
        />
        <SummaryCard
          label="Uploaded Videos"
          value={loading ? "..." : totalVideos}
          note="Training videos currently uploaded."
          tone="green"
        />
        <SummaryCard
          label="Topics With Videos"
          value={loading ? "..." : topicsWithVideos}
          note="Premium topics already connected with videos."
          tone="amber"
        />
      </div>

      <div className="sav-upload-card">
        <div className="sav-upload-card__header">
          <div>
            <h3 className="sav-upload-card__title">Upload Video From Computer</h3>
            <p className="sav-upload-card__subtitle">
              Select premium module, select premium topic, then upload your video file.
            </p>
          </div>
        </div>

        <div className="sav-upload-grid">
          <div>
            <label className="sav-field-label">Premium Module</label>
            <select
              value={selectedModuleId}
              onChange={(e) => {
                setSelectedModuleId(e.target.value);
                setSelectedTopicId("");
              }}
              className="sav-field-input"
            >
              <option value="">Select premium module</option>
              {premiumModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="sav-field-label">Premium Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="sav-field-input"
              disabled={!selectedModuleId}
            >
              <option value="">Select premium topic</option>
              {filteredTopicsForUpload.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sav-upload-grid__full">
            <label className="sav-field-label">Video Title</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Enter video title or leave blank to use file name"
              className="sav-field-input"
            />
          </div>

          <div className="sav-upload-grid__full">
            <label className="sav-field-label">Choose Video File</label>
            <input
              id="premium-video-file-input"
              type="file"
              accept="video/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="sav-field-input sav-field-input--file"
            />
          </div>

          {selectedFile && (
            <div className="sav-upload-grid__full">
              <div className="sav-file-preview">
                <p className="sav-file-preview__name">{selectedFile.name}</p>
                <p className="sav-file-preview__meta">
                  {formatBytes(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sav-upload-actions">
          <button
            type="button"
            onClick={handleUploadVideo}
            disabled={uploading}
            className={`sav-primary-btn ${uploading ? "sav-primary-btn--disabled" : ""}`}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>

          <button
            type="button"
            onClick={clearUploadForm}
            className="sav-secondary-btn"
            disabled={uploading}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="sav-toolbar-card">
        <div className="sav-toolbar">
          <div className="sav-toolbar__search">
            <label className="sav-field-label">Search</label>
            <input
              type="text"
              placeholder="Search module, topic, or video..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sav-field-input"
            />
          </div>

          <div className="sav-toolbar__filter">
            <label className="sav-field-label">Premium Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="sav-field-input"
            >
              <option>All Premium Modules</option>
              {premiumModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sav-toolbar__actions">
            <button
              type="button"
              onClick={clearFilters}
              className="sav-secondary-btn"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="sav-list-wrap">
        {loading ? (
          <div className="sav-section-card">
            <p className="sav-loading-text">Loading premium videos...</p>
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="sav-section-card">
            <p className="sav-empty-text">
              No premium modules, topics, or videos found.
            </p>
          </div>
        ) : (
          filteredBlocks.map(({ module, topics: moduleTopics }) => (
            <div key={module.id} className="sav-module-wrap">
              {moduleTopics.map(({ topic, videos: topicVideos }) => (
                <TopicVideoBlock
                  key={topic.id}
                  module={module}
                  topic={topic}
                  videos={topicVideos}
                  onDelete={handleDeleteVideo}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}