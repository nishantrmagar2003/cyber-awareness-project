import { Outlet, useLocation } from "react-router-dom";

import SuperAdminSidebar from "../components/common/SuperAdminSidebar";
import "../styles/superadmin.css";
import TopNavbar from "../components/common/TopNavbar";

const PAGE_TITLES = {
  "/superadmin/dashboard": "Dashboard",
  "/superadmin/organizations": "Organizations",
  "/superadmin/users": "Users Management",
  "/superadmin/modules": "Modules Management",
  "/superadmin/topics": "Topics Management",
  "/superadmin/videos": "Videos Management",
  "/superadmin/quizzes": "Quizzes Management",
  "/superadmin/simulations": "Simulations Management",
  "/superadmin/badges": "Badges Management",
  "/superadmin/settings": "System Settings",
};

export default function SuperAdminLayout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";

  return (
    <div className="sa-root">
      <div className="sa-shell">
        <SuperAdminSidebar />

        <div className="sa-content-area">
          <TopNavbar pageTitle={pageTitle} role="Super Admin" />

          <main className="sa-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
