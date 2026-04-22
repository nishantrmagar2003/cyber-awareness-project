import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  { label: "Dashboard", icon: "⊞", to: "/organization/dashboard" },
  { label: "Students", icon: "🎓", to: "/organization/students" },
  { label: "Reports", icon: "📊", to: "/organization/reports" },
  { label: "Settings", icon: "⚙️", to: "/organization/settings" },
];

export default function OrgAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const displayName = user.full_name || user.name || "Org Admin";
  const email = user.email || "org@cyber.np";

  return (
    <aside
      className={`org-sidebar ${
        collapsed ? "org-sidebar--collapsed" : "org-sidebar--expanded"
      }`}
    >
      <div className="org-sidebar__header">
        {!collapsed ? (
          <>
            <div className="org-sidebar__brand">
              <div className="org-sidebar__logo">CA</div>

              <div className="org-sidebar__brand-text">
                <p className="org-sidebar__title">CyberAware</p>
                <p className="org-sidebar__role">Organization Admin</p>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="org-sidebar__toggle"
              type="button"
              aria-label="Collapse sidebar"
            >
              ◀
            </button>
          </>
        ) : (
          <div className="org-sidebar__collapsed-top">
            <div className="org-sidebar__logo">CA</div>

            <button
              onClick={() => setCollapsed(false)}
              className="org-sidebar__toggle"
              type="button"
              aria-label="Expand sidebar"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      <nav className="org-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              `org-nav__item ${isActive ? "org-nav__item--active" : ""}`
            }
          >
            <span className="org-nav__icon">{item.icon}</span>
            {!collapsed && (
              <span className="org-nav__label">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="org-sidebar__footer">
          <div className="org-sidebar__user">
            <div className="org-sidebar__avatar">
              {(displayName || "OA")
                .split(" ")
                .filter(Boolean)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="org-sidebar__user-meta">
              <p className="org-sidebar__user-name">{displayName}</p>
              <p className="org-sidebar__user-email">{email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}