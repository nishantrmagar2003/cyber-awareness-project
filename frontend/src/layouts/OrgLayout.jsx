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

export default function OrganizationLayout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "Organization Dashboard";

  return (
    <div className="org-root">
      <div className="org-shell">
        <OrgAdminSidebar />

        <div className="org-content-area">
          <TopNavbar pageTitle={pageTitle} role="Organization Admin" />

          <main className="org-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}