import { useState } from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  { label: "Dashboard", icon: "⊞", to: "/superadmin/dashboard" },
  { label: "Organizations", icon: "🏢", to: "/superadmin/organizations" },
  { label: "Users", icon: "👥", to: "/superadmin/users" },
  { label: "Modules", icon: "📦", to: "/superadmin/modules" },
  { label: "Topics", icon: "📑", to: "/superadmin/topics" },
  { label: "Videos", icon: "🎬", to: "/superadmin/videos" },
  { label: "Quizzes", icon: "🧠", to: "/superadmin/quizzes" },
  { label: "Simulations", icon: "🎯", to: "/superadmin/simulations" },
  { label: "Badges", icon: "🏅", to: "/superadmin/badges" },
  { label: "System Settings", icon: "⚙️", to: "/superadmin/settings" },
];

export default function SuperAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sa-sidebar ${
        collapsed ? "sa-sidebar--collapsed" : "sa-sidebar--expanded"
      }`}
    >
      <div className="sa-sidebar__header">
        {!collapsed ? (
          <>
            <div className="sa-sidebar__brand">
              <div className="sa-sidebar__logo">CA</div>

              <div>
                <p className="sa-sidebar__title">CyberAware</p>
                <p className="sa-sidebar__role">Super Admin</p>
              </div>
            </div>

            <button
              type="button"
              className="sa-sidebar__toggle"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              ◀
            </button>
          </>
        ) : (
          <div className="sa-sidebar__collapsed-top">
            <div className="sa-sidebar__logo">CA</div>

            <button
              type="button"
              className="sa-sidebar__toggle"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      <nav className="sa-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              `sa-nav__item ${isActive ? "sa-nav__item--active" : ""}`
            }
          >
            <span className="sa-nav__icon">{item.icon}</span>
            {!collapsed && <span className="sa-nav__label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="sa-sidebar__footer">
          <div className="sa-sidebar__user">
            <div className="sa-sidebar__avatar">SA</div>

            <div className="sa-sidebar__user-meta">
              <p className="sa-sidebar__user-name">Super Admin</p>
              <p className="sa-sidebar__user-email">admin@cyber.np</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}