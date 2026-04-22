import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "../../styles/student-layout.css";

const STUDENT_LINKS = [
  { to: "/student/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/student/modules", label: "Modules", icon: "📚" },
  { to: "/student/progress", label: "Progress", icon: "📈" },
  { to: "/student/badges", label: "Badges", icon: "🏅" },
  { to: "/student/certificate", label: "Certificate", icon: "📜" },
  { to: "/student/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const displayName = user.full_name || user.name || "Student";
  const email = user.email || "student@cyber.np";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`student-sidebar ${
        collapsed ? "student-sidebar--collapsed" : "student-sidebar--expanded"
      }`}
    >
      <div className="student-sidebar__header">
        {!collapsed ? (
          <>
            <div className="student-sidebar__brand">
              <div className="student-sidebar__logo">CA</div>

              <div className="student-sidebar__brand-text">
                <p className="student-sidebar__title">CyberAware</p>
                <p className="student-sidebar__role">Student Portal</p>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="student-sidebar__toggle"
              type="button"
              aria-label="Collapse sidebar"
            >
              ◀
            </button>
          </>
        ) : (
          <div className="student-sidebar__collapsed-top">
            <div className="student-sidebar__logo">CA</div>

            <button
              onClick={() => setCollapsed(false)}
              className="student-sidebar__toggle"
              type="button"
              aria-label="Expand sidebar"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      <nav className="student-nav">
        {STUDENT_LINKS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              `student-nav__item ${isActive ? "student-nav__item--active" : ""}`
            }
            end={item.to === "/student/dashboard"}
          >
            <span className="student-nav__icon">{item.icon}</span>
            {!collapsed && (
              <span className="student-nav__label">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="student-sidebar__footer">
          <div className="student-sidebar__user">
            <div className="student-sidebar__avatar">{initials}</div>

            <div className="student-sidebar__user-meta">
              <p className="student-sidebar__user-name">{displayName}</p>
              <p className="student-sidebar__user-email">{email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}