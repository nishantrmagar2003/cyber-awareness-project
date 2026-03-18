import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_TITLES = {
  dashboard: "Student Dashboard",
  modules: "Learning Modules",
  progress: "Progress",
  badges: "Badges",
  certificate: "Certificate",
  settings: "Settings",
  quiz: "Quiz",
  simulation: "Simulation",
  topic: "Topic Details",
  video: "Video Player",
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const pageKey = location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const pageTitle = PAGE_TITLES[pageKey] || "Student Portal";
  const userName = user.full_name || user.name || "Student";
  const email = user.email || "student@cyber.np";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="student-topbar">
      <div>
        <p className="student-topbar__eyebrow">Cyber Awareness</p>
        <h1 className="student-topbar__title">{pageTitle}</h1>
      </div>

      <div className="student-topbar__actions">
        <button className="student-topbar__notification" type="button" aria-label="Notifications">
          🔔
        </button>

        <div className="student-topbar__profile-wrap">
          <button
            type="button"
            className="student-topbar__profile"
            onClick={() => setOpen((prev) => !prev)}
          >
            <div className="student-topbar__avatar">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="student-topbar__meta">
              <strong>{userName}</strong>
              <span>{email}</span>
            </div>
            <span className="student-topbar__caret">▾</span>
          </button>

          {open && (
            <div className="student-topbar__dropdown">
              <button type="button" onClick={() => navigate("/student/settings")}>Settings</button>
              <button type="button" onClick={() => navigate("/student/certificate")}>Certificate</button>
              <button type="button" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
