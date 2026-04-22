import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import SuperAdminSidebar from "../components/common/SuperAdminSidebar";
import "../styles/superadmin.css";
import TopNavbar from "../components/common/TopNavbar";

export default function SuperAdminLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  let pageTitle = "Dashboard";

  if (pathname === "/superadmin/dashboard") {
    pageTitle = "Dashboard";
  } else if (pathname === "/superadmin/organizations") {
    pageTitle = "Organizations";
  } else if (pathname.startsWith("/superadmin/organizations/")) {
    pageTitle = "Organization Details";
  } else if (pathname === "/superadmin/users") {
    pageTitle = "Users Management";
  } else if (pathname === "/superadmin/modules") {
    pageTitle = "Modules Management";
  } else if (pathname === "/superadmin/topics") {
    pageTitle = "Topics Management";
  } else if (pathname === "/superadmin/videos") {
    pageTitle = "Videos Management";
  } else if (pathname === "/superadmin/quizzes") {
    pageTitle = "Quizzes Management";
  } else if (pathname === "/superadmin/simulations") {
    pageTitle = "Simulations Management";
  } else if (pathname === "/superadmin/badges") {
    pageTitle = "Badges Management";
  } else if (pathname === "/superadmin/settings") {
    pageTitle = "System Settings";
  }

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