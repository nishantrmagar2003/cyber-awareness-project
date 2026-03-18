import { Outlet, useLocation } from "react-router-dom";

import OrgAdminSidebar from "../components/common/OrgAdminSidebar";
import TopNavbar from "../components/common/TopNavbar";

import "../styles/org-layout.css";

const PAGE_TITLES = {
  "/organization/dashboard": "Organization Dashboard",
  "/organization/students": "Students",
  "/organization/reports": "Reports",
  "/organization/settings": "Settings",
};

export default function OrgLayout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "Organization Dashboard";

  return (
    <div className="sa-root">
      <div className="sa-shell">
        <OrgAdminSidebar />

        <div className="sa-content-area">
          <TopNavbar pageTitle={pageTitle} role="Organization Admin" />

          <main className="sa-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
