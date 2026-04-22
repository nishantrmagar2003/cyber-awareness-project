import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopNavbar({ pageTitle, role = "Super Admin" }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const displayName = user.full_name || user.name || role;
  const email =
    user.email || (role === "Super Admin" ? "admin@cyber.np" : "org@cyber.np");

  const settingsPath =
    role === "Super Admin"
      ? "/superadmin/settings"
      : "/organization/settings";

  const initials = useMemo(() => {
    const source = displayName || role;
    return source
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [displayName, role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="app-topbar">
      <div className="app-topbar__left">
        <p className="app-topbar__eyebrow">{role}</p>
        <h2 className="app-topbar__title">{pageTitle}</h2>
      </div>

      <div className="app-topbar__right">
        <div className="app-topbar__profile" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            type="button"
            className="app-topbar__profile-btn"
          >
            <div className="app-topbar__avatar">{initials}</div>

            <div className="app-topbar__meta">
              <p className="app-topbar__name">{displayName}</p>
              <p className="app-topbar__email">{email}</p>
            </div>

            <span
              className={`app-topbar__caret ${dropdownOpen ? "is-open" : ""}`}
            >
              ▾
            </span>
          </button>

          {dropdownOpen && (
            <div className="app-topbar__dropdown">
              <div className="app-topbar__dropdown-head">
                <p className="app-topbar__dropdown-name">{displayName}</p>
                <p className="app-topbar__dropdown-email">{email}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(settingsPath);
                }}
                className="app-topbar__dropdown-item"
              >
                <span>⚙️</span>
                <span>Settings</span>
              </button>

              <div className="app-topbar__dropdown-divider" />

              <button
                type="button"
                onClick={handleLogout}
                className="app-topbar__dropdown-item app-topbar__dropdown-item--danger"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}