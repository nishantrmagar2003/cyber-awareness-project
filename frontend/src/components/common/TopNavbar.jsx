import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopNavbar({ pageTitle, role = "Super Admin" }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const displayName = user.full_name || user.name || role;
  const email = user.email || (role === "Super Admin" ? "admin@cyber.np" : "org@cyber.np");

  const settingsPath = role === "Super Admin" ? "/superadmin/settings" : "/organization/settings";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-base font-semibold text-slate-700">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors" type="button">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {role === "Super Admin" ? "SA" : "OA"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-700">{displayName}</p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>
            <span className="text-slate-400 text-xs">▾</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
              <button type="button" onClick={() => navigate(settingsPath)} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                <span>⚙️</span> Settings
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button type="button" onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50">
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
