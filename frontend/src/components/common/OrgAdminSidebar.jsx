import { useState } from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  { label: "Dashboard", icon: "⊞", to: "/organization/dashboard" },
  { label: "Students", icon: "🎓", to: "/organization/students" },
  { label: "Reports", icon: "📊", to: "/organization/reports" },
  { label: "Settings", icon: "⚙️", to: "/organization/settings" },
];

export default function OrgAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col bg-slate-900 text-white
        transition-all duration-300 ease-in-out h-screen sticky top-0
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/60">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold">CA</div>
            <div>
              <p className="text-sm font-bold leading-tight">CyberAware</p>
              <p className="text-xs text-indigo-400 font-medium">Org Admin</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold mx-auto">CA</div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="text-slate-400 hover:text-white text-sm transition-colors">
            ◀
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="text-slate-400 hover:text-white text-sm transition-colors py-3 text-center">
          ▶
        </button>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 text-left no-underline
              ${isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"}
            `}
            title={collapsed ? item.label : ""}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-4 py-4 border-t border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">OA</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Org Admin</p>
              <p className="text-xs text-slate-400 truncate">org@cyber.np</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
