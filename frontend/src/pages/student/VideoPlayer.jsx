import { useParams } from "react-router-dom";

export default function VideoPlayer() {
  const { id } = useParams();

  const videoMap = {
    1: "password-security.mp4",
    2: "2fa.mp4",
    3: "digital-identity-protection.mp4",
    4: "phishing.mp4",
    5: "qr-code-scam-awareness.mp4",
    6: "safe-website-app-verification.mp4",
    7: "mobile-safety.mp4",
    8: "cyberbullying-awareness.mp4",
    9: "cyber-security-awareness-companies-workplace.mp4"
  };
 

  const videoFile = videoMap[id];

  return (
    <div className="bg-white shadow rounded-lg p-6 border">
      {videoFile ? (
        <video width="100%" height="500" controls>
          <source
            src={`http://localhost:8000/videos/${videoFile}`}
            type="video/mp4"
          />
          Your browser does not support video.
        </video>
      ) : (
        <p>No video available for this topic.</p>
      )}
    </div>
  );
}