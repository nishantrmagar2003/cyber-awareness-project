import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/video-player.css";

export default function VideoPlayer({ videoUrl = null, onComplete }) {
  const { id } = useParams();

  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);

  const videoMap = {
    1: "password-security.mp4",
    2: "2fa.mp4",
    3: "digital-identity-protection.mp4",
    4: "phishing.mp4",
    5: "qr-code-scam-awareness.mp4",
    6: "safe-website-app-verification.mp4",
    7: "mobile-safety.mp4",
    8: "cyberbullying-awareness.mp4",
    9: "cyber-security-awareness-companies-workplace.mp4",
  };

  useEffect(() => {
    let cancelled = false;

    async function loadTopic() {
      try {
        setLoading(true);

        const res = await api.get(`/topics/${id}`);
        const data = res?.data?.data || null;

        if (!cancelled) {
          setTopicData(data);
        }
      } catch (error) {
        console.error("VideoPlayer topic load error:", error);

        if (!cancelled) {
          setTopicData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadTopic();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const videoSrc = useMemo(() => {
    if (videoUrl) {
      if (String(videoUrl).startsWith("http")) {
        return videoUrl;
      }
      return `http://localhost:8000${videoUrl}`;
    }

    if (!topicData) return null;

    const isGeneralTopic =
      Number(topicData.is_public || 0) === 1 &&
      topicData.audience_type === "general";

    if (isGeneralTopic) {
      const videoFile = videoMap[id];
      return videoFile ? `http://localhost:8000/videos/${videoFile}` : null;
    }

    if (topicData.video_url) {
      if (String(topicData.video_url).startsWith("http")) {
        return topicData.video_url;
      }

      return `http://localhost:8000${topicData.video_url}`;
    }

    return null;
  }, [id, topicData, videoUrl]);

  if (loading && !videoUrl) {
    return (
      <div className="vp-card">
        <div className="vp-loading">Loading video...</div>
      </div>
    );
  }

  return (
    <div className="vp-card">
      {videoSrc ? (
        <>
          <div className="vp-header">
            <div>
              <p className="vp-eyebrow">Learning Video</p>
              <h3 className="vp-title">
                {topicData?.title || "Topic Video"}
              </h3>
            </div>
          </div>

          <div className="vp-player-wrap">
            <video
              className="vp-player"
              controls
              onEnded={() => {
                if (onComplete) onComplete();
              }}
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support video.
            </video>
          </div>
        </>
      ) : (
        <div className="vp-empty">
          <h3 className="vp-empty__title">No video available</h3>
          <p className="vp-empty__text">
            This topic does not have a video file yet.
          </p>
        </div>
      )}
    </div>
  );
}