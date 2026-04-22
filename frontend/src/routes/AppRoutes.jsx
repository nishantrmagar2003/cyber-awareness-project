import React from "react"; // ✅ REQUIRED
import { Routes, Route, Navigate } from "react-router-dom";
import RequireOrg from "../app/routeGuards/RequireOrg";

import PublicLayout from "../layouts/PublicLayout";
import StudentLayout from "../layouts/StudentLayout";
import OrgLayout from "../layouts/OrgLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

import RequireAuth from "../app/routeGuards/RequireAuth";
import RequireRole from "../app/routeGuards/RequireRole";

import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";

import StudentDashboard from "../pages/student/Dashboard";
import Modules from "../pages/student/Modules";
import ModuleDetails from "../pages/student/ModuleDetails";
import TopicDetails from "../pages/student/TopicDetails";
import VideoPlayer from "../pages/student/VideoPlayer";
import QuizPage from "../pages/student/QuizPage";
import SimulationPage from "../pages/student/SimulationPage";
import Progress from "../pages/student/Progress";
import Badges from "../pages/student/Badges";
import Certificate from "../pages/student/Certificate";
import StudentSettings from "../pages/student/Settings";

import OrgDashboard from "../pages/organization/Dashboard";
import Students from "../pages/organization/Students";
import StudentDetails from "../pages/organization/StudentDetails";
import Reports from "../pages/organization/Reports";
import OrgSettings from "../pages/organization/Settings";

import AdminDashboard from "../pages/superadmin/Dashboard";
import Organizations from "../pages/superadmin/Organizations";
import OrganizationDetails from "../pages/superadmin/OrganizationDetails";
import Users from "../pages/superadmin/Users";
import ModulesAdmin from "../pages/superadmin/Modules";
import Videos from "../pages/superadmin/Videos";
import Quizzes from "../pages/superadmin/Quizzes";
import Simulations from "../pages/superadmin/Simulations";
import Topics from "../pages/superadmin/Topics";
import BadgesAdmin from "../pages/superadmin/Badges";
import SystemSettings from "../pages/superadmin/SystemSettings";

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* STUDENT ROUTES */}
      <Route
        path="/student"
        element={
          <RequireAuth>
            <RequireRole role={["general_user", "org_student"]}>
              <StudentLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="modules" element={<Modules />} />
        <Route path="module/:id" element={<ModuleDetails />} />
        <Route path="topic/:id" element={<TopicDetails />} />
        <Route path="video/:id" element={<VideoPlayer />} />
        <Route path="quiz/:id" element={<QuizPage />} />
        <Route path="simulation/:id" element={<SimulationPage />} />
        <Route path="progress" element={<Progress />} />
        <Route path="badges" element={<Badges />} />
        <Route path="certificate" element={<Certificate />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      {/* ORGANIZATION ADMIN ROUTES */}
      <Route
        path="/organization"
        element={
          <RequireAuth>
            <RequireRole role="org_admin">
              <RequireOrg>
                <OrgLayout />
              </RequireOrg>
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrgDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<OrgSettings />} />
      </Route>

      {/* SUPERADMIN ROUTES */}
      <Route
        path="/superadmin"
        element={
          <RequireAuth>
            <RequireRole role="superadmin">
              <SuperAdminLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="organizations/:id" element={<OrganizationDetails />} />
        <Route path="users" element={<Users />} />
        <Route path="modules" element={<ModulesAdmin />} />
        <Route path="videos" element={<Videos />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="simulations" element={<Simulations />} />
        <Route path="topics" element={<Topics />} />
        <Route path="badges" element={<BadgesAdmin />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default AppRoutes;