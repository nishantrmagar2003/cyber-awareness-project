import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import StatsCard from "../../components/ui/StatsCard";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";

/* =========================================
   MOCK DATA
========================================= */

const MOCK_STATS = {
  totalOrganizations: 24,
  totalStudents: 1842,
  totalUsers: 2109,
  totalModules: 38,
  totalQuizzes: 156,
  activeOrganizations: 19,
};

const MOCK_ORGS = [
  { name: "TechCorp Nepal", industry: "Technology", status: "Active", created: "2024-01-10" },
  { name: "FinServe Ltd", industry: "Finance", status: "Active", created: "2024-02-14" },
  { name: "HealthPlus", industry: "Healthcare", status: "Inactive", created: "2024-03-05" },
  { name: "EduNepal", industry: "Education", status: "Active", created: "2024-03-22" },
  { name: "GovSec Agency", industry: "Government", status: "Suspended", created: "2024-04-01" },
];

const MOCK_USERS = [
  { name: "Arun Sharma", email: "arun@tech.np", role: "Student", org: "TechCorp Nepal", status: "Active" },
  { name: "Priya Thapa", email: "priya@fin.np", role: "Org Admin", org: "FinServe Ltd", status: "Active" },
  { name: "Bikash KC", email: "bikash@health.np", role: "Student", org: "HealthPlus", status: "Inactive" },
  { name: "Sita Rai", email: "sita@edu.np", role: "Student", org: "EduNepal", status: "Active" },
  { name: "Rajan Poudel", email: "rajan@gov.np", role: "Org Admin", org: "GovSec Agency", status: "Pending" },
];

/* =========================================
   COMPONENT
========================================= */

export default function SuperAdminDashboard() {

  const [stats, setStats] = useState(MOCK_STATS);
  const [orgs, setOrgs] = useState(MOCK_ORGS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(false);

  /* =========================================
     FETCH DATA
  ========================================= */

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Uncomment when backend ready

        // const statsRes = await axios.get("/api/stats/superadmin");
        // const orgRes = await axios.get("/api/organizations?limit=5");
        // const userRes = await axios.get("/api/users?limit=5");

        // setStats(statsRes.data);
        // setOrgs(orgRes.data);
        // setUsers(userRes.data);

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /* =========================================
     TABLE COLUMNS
  ========================================= */

  const orgColumns = useMemo(() => [
    { key: "name", label: "Organization" },
    { key: "industry", label: "Industry" },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    { key: "created", label: "Created" },
  ], []);

  const userColumns = useMemo(() => [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          {r.role}
        </span>
      ),
    },
    { key: "org", label: "Organization" },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ], []);

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="p-6 space-y-8">

      {/* =========================================
          WELCOME
      ========================================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Overview
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Welcome back, Super Admin — here's what's happening on the platform.
        </p>
      </div>

      {/* =========================================
          STATS GRID
      ========================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

        <StatsCard
          title="Total Organizations"
          value={stats?.totalOrganizations ?? 0}
          icon="🏢"
          color="blue"
          change={8}
        />

        <StatsCard
          title="Total Students"
          value={(stats?.totalStudents ?? 0).toLocaleString()}
          icon="🎓"
          color="green"
          change={14}
        />

        <StatsCard
          title="Total Users"
          value={(stats?.totalUsers ?? 0).toLocaleString()}
          icon="👥"
          color="indigo"
          change={11}
        />

        <StatsCard
          title="Total Modules"
          value={stats?.totalModules ?? 0}
          icon="📦"
          color="amber"
          change={5}
        />

        <StatsCard
          title="Total Quizzes"
          value={stats?.totalQuizzes ?? 0}
          icon="🧠"
          color="sky"
          change={20}
        />

        <StatsCard
          title="Active Organizations"
          value={stats?.activeOrganizations ?? 0}
          icon="✅"
          color="green"
          change={3}
        />

      </div>

      {/* =========================================
          RECENT ORGANIZATIONS
      ========================================= */}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Recent Organizations
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Latest organizations registered on the platform
            </p>
          </div>

          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View all →
          </button>

        </div>

        <DataTable
          columns={orgColumns}
          data={orgs}
          loading={loading}
        />

      </div>

      {/* =========================================
          RECENT USERS
      ========================================= */}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Recent Users
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Latest users across all organizations
            </p>
          </div>

          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View all →
          </button>

        </div>

        <DataTable
          columns={userColumns}
          data={users}
          loading={loading}
        />

      </div>

    </div>
  );
}