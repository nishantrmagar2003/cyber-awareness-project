import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import StatsCard from "../../components/ui/StatsCard";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import "./Dashboard.css";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeStatus(status) {
  if (!status) return "Inactive";

  const value = String(status).toLowerCase();

  if (value === "active") return "Active";
  if (value === "pending") return "Pending";
  if (value === "suspended") return "Suspended";

  return "Inactive";
}

function normalizeRole(role) {
  if (!role) return "-";

  if (role === "superadmin") return "Super Admin";
  if (role === "org_admin") return "Org Admin";
  if (role === "org_student") return "Org Student";
  if (role === "general_user") return "General User";

  return role;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getActiveCount(list = []) {
  return list.filter((item) => item.status === "Active").length;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    total_organizations: 0,
    total_org_admins: 0,
    total_students: 0,
    total_premium_modules: 0,
    total_quizzes: 0,
    total_simulations: 0,
  });

  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);

        const res = await api.get("/organizations/superadmin/dashboard");
        const data = res?.data?.data || {};
        const statsData = data?.stats || {};

        if (cancelled) return;

        setStats({
          total_organizations: toNumber(statsData.total_organizations),
          total_org_admins: toNumber(statsData.total_org_admins),
          total_students: toNumber(statsData.total_students),
          total_premium_modules: toNumber(statsData.total_premium_modules),
          total_quizzes: toNumber(statsData.total_quizzes),
          total_simulations: toNumber(statsData.total_simulations),
        });

        setOrganizations(
          Array.isArray(data?.recent_organizations)
            ? data.recent_organizations.map((row) => ({
                id: row.id,
                name: row.name || "Organization",
                industry: row.industry || "-",
                status: normalizeStatus(row.status),
                created: formatDate(row.created_at),
              }))
            : []
        );

        setUsers(
          Array.isArray(data?.recent_users)
            ? data.recent_users.map((row) => ({
                id: row.id,
                name: row.full_name || "User",
                email: row.email || "-",
                role: normalizeRole(row.role),
                org: row.organization_name || "-",
                status: normalizeStatus(row.status),
                created: formatDate(row.created_at),
              }))
            : []
        );
      } catch (err) {
        console.error("Superadmin dashboard load error:", err);

        if (!cancelled) {
          setStats({
            total_organizations: 0,
            total_org_admins: 0,
            total_students: 0,
            total_premium_modules: 0,
            total_quizzes: 0,
            total_simulations: 0,
          });
          setOrganizations([]);
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const orgColumns = useMemo(
    () => [
      { key: "name", label: "Organization" },
      { key: "industry", label: "Industry" },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      { key: "created", label: "Created" },
    ],
    []
  );

  const userColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "role",
        label: "Role",
        render: (row) => (
          <span className="sa-role-pill">
            {row.role}
          </span>
        ),
      },
      { key: "org", label: "Organization" },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    []
  );

  const totalUsers = useMemo(() => {
    return toNumber(stats.total_org_admins) + toNumber(stats.total_students);
  }, [stats.total_org_admins, stats.total_students]);

  const activeOrganizations = useMemo(() => {
    return getActiveCount(organizations);
  }, [organizations]);

  const activeUsers = useMemo(() => {
    return getActiveCount(users);
  }, [users]);

  const systemHealth = useMemo(() => {
    if (loading) return "Loading";
    if (stats.total_organizations === 0 && totalUsers === 0) return "Low Activity";
    if (activeOrganizations > 0 || activeUsers > 0) return "Healthy";
    return "Needs Review";
  }, [loading, stats.total_organizations, totalUsers, activeOrganizations, activeUsers]);

  const dashboardSummary = useMemo(() => {
    return {
      totalOrganizations: toNumber(stats.total_organizations),
      totalUsers,
      activeOrganizations,
      activeUsers,
      premiumModules: toNumber(stats.total_premium_modules),
      quizzes: toNumber(stats.total_quizzes),
      simulations: toNumber(stats.total_simulations),
    };
  }, [stats, totalUsers, activeOrganizations, activeUsers]);

  return (
    <div className="sa-dashboard">
      <section className="sa-hero">
        <div className="sa-hero__content">
          <div>
            <p className="sa-hero__eyebrow">Super Admin Control Center</p>
            <h1 className="sa-hero__title">Platform Dashboard Overview</h1>
            <p className="sa-hero__subtitle">
              Monitor organizations, users, and premium learning content from one place.
            </p>
          </div>

          <div className="sa-hero__health">
            <div className="sa-hero__health-label">System Status</div>
            <div className="sa-hero__health-value">{systemHealth}</div>
          </div>
        </div>

        <div className="sa-hero__stats">
          <div className="sa-hero-stat-card">
            <span className="sa-hero-stat-label">Organizations</span>
            <strong className="sa-hero-stat-value">
              {loading ? "..." : dashboardSummary.totalOrganizations}
            </strong>
          </div>

          <div className="sa-hero-stat-card">
            <span className="sa-hero-stat-label">Total Managed Users</span>
            <strong className="sa-hero-stat-value">
              {loading ? "..." : dashboardSummary.totalUsers}
            </strong>
          </div>

          <div className="sa-hero-stat-card">
            <span className="sa-hero-stat-label">Premium Modules</span>
            <strong className="sa-hero-stat-value">
              {loading ? "..." : dashboardSummary.premiumModules}
            </strong>
          </div>

          <div className="sa-hero-stat-card">
            <span className="sa-hero-stat-label">Assessment Content</span>
            <strong className="sa-hero-stat-value">
              {loading
                ? "..."
                : dashboardSummary.quizzes + dashboardSummary.simulations}
            </strong>
          </div>
        </div>
      </section>

      <section className="sa-stats-grid">
        <StatsCard
          title="Total Organizations"
          value={loading ? "..." : stats.total_organizations}
          icon="🏢"
          color="blue"
        />

        <StatsCard
          title="Total Org Admins"
          value={loading ? "..." : stats.total_org_admins}
          icon="🧑‍💼"
          color="indigo"
        />

        <StatsCard
          title="Total Students"
          value={loading ? "..." : stats.total_students}
          icon="🎓"
          color="green"
        />

        <StatsCard
          title="Premium Modules"
          value={loading ? "..." : stats.total_premium_modules}
          icon="📦"
          color="amber"
        />

        <StatsCard
          title="Total Quizzes"
          value={loading ? "..." : stats.total_quizzes}
          icon="🧠"
          color="blue"
        />

        <StatsCard
          title="Total Simulations"
          value={loading ? "..." : stats.total_simulations}
          icon="🛡️"
          color="green"
        />
      </section>

      <section className="sa-insight-grid">
        <div className="sa-insight-card">
          <p className="sa-insight-card__label">Active Organizations</p>
          <h3 className="sa-insight-card__value">
            {loading ? "..." : activeOrganizations}
          </h3>
          <p className="sa-insight-card__note">
            Based on recent organizations currently marked active.
          </p>
        </div>

        <div className="sa-insight-card">
          <p className="sa-insight-card__label">Active Users</p>
          <h3 className="sa-insight-card__value">
            {loading ? "..." : activeUsers}
          </h3>
          <p className="sa-insight-card__note">
            Based on recent users currently marked active.
          </p>
        </div>

        <div className="sa-insight-card">
          <p className="sa-insight-card__label">Premium Content Focus</p>
          <h3 className="sa-insight-card__value">
            {loading ? "..." : stats.total_premium_modules}
          </h3>
          <p className="sa-insight-card__note">
            General modules stay static. Super admin manages premium learning content only.
          </p>
        </div>
      </section>

      <div className="sa-table-card">
        <div className="sa-section-header">
          <div>
            <h2 className="sa-section-title">Recent Organizations</h2>
            <p className="sa-section-subtitle">
              Latest organizations registered on the platform
            </p>
          </div>
        </div>

        <DataTable
          columns={orgColumns}
          data={organizations}
          emptyMessage={loading ? "Loading organizations..." : "No organizations found."}
        />
      </div>

      <div className="sa-table-card">
        <div className="sa-section-header">
          <div>
            <h2 className="sa-section-title">Recent Users</h2>
            <p className="sa-section-subtitle">
              Latest users across all organizations
            </p>
          </div>
        </div>

        <DataTable
          columns={userColumns}
          data={users}
          emptyMessage={loading ? "Loading users..." : "No users found."}
        />
      </div>
    </div>
  );
}