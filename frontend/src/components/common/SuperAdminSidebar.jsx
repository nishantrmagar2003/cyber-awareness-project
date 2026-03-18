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
      className={`
        sa-sidebar
        flex flex-col bg-slate-900 text-white
        transition-all duration-300 ease-in-out h-screen sticky top-0
        ${collapsed ? "w-16 sa-sidebar--collapsed" : "w-60 sa-sidebar--expanded"}
      `}
    >
      <div className="sa-sidebar__header flex items-center justify-between px-4 py-5 border-b border-slate-700/60">
        {!collapsed && (
          <div className="sa-sidebar__brand flex items-center gap-2">
            <div className="sa-sidebar__logo w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-sm font-bold">
              CA
            </div>
            <div>
              <p className="sa-sidebar__title text-sm font-bold leading-tight">CyberAware</p>
              <p className="sa-sidebar__role text-xs text-blue-400 font-medium">Super Admin</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="sa-sidebar__logo w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-sm font-bold mx-auto">
            CA
          </div>
        )}

        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="sa-sidebar__toggle text-slate-400 hover:text-white text-sm transition-colors">
            ◀
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="sa-sidebar__toggle text-slate-400 hover:text-white text-sm transition-colors py-3 text-center">
          ▶
        </button>
      )}

      <nav className="sa-nav flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              sa-nav__item
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 text-left no-underline
              ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/40 sa-nav__item--active"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"}
            `}
            title={collapsed ? item.label : ""}
          >
            <span className="sa-nav__icon text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="sa-nav__label truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="sa-sidebar__footer px-4 py-4 border-t border-slate-700/60">
          <div className="sa-sidebar__user flex items-center gap-3">
            <div className="sa-sidebar__avatar w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="sa-sidebar__user-name text-xs font-semibold truncate">Super Admin</p>
              <p className="sa-sidebar__user-email text-xs text-slate-400 truncate">admin@cyber.np</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
