import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../services/api";
import "../../styles/users.css";

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

function formatRole(role) {
  if (role === "org_admin") return "Org Admin";
  if (role === "org_student") return "Org Student";
  if (role === "general_user") return "General Student";
  return role || "-";
}

function UserAvatar({ name }) {
  const initials = (name || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <div className="users-avatar">{initials}</div>;
}

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`users-summary-card users-summary-card--${tone}`}>
      <p className="users-summary-card__label">{label}</p>
      <h3 className="users-summary-card__value">{value}</h3>
      <p className="users-summary-card__note">{note}</p>
    </div>
  );
}

function SectionTable({ title, subtitle, columns, rows, emptyMessage }) {
  return (
    <div className="users-panel">
      <div className="users-panel__header">
        <h2 className="users-panel__title">{title}</h2>
        {subtitle ? <p className="users-panel__subtitle">{subtitle}</p> : null}
      </div>

      <DataTable columns={columns} data={rows} emptyMessage={emptyMessage} />
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get("/auth/superadmin/users");
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

      setUsers(
        rows.map((row) => ({
          id: row.id,
          name: row.full_name || "User",
          email: row.email || "-",
          phone: row.phone || "-",
          roleRaw: row.role || "",
          role: formatRole(row.role),
          org: row.organization_name || "-",
          status: normalizeStatus(row.status),
          created: formatDate(row.created_at),
        }))
      );
    } catch (error) {
      console.error("Get superadmin users error:", error);
      setUsers([]);
      setErrorMessage(error?.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("All Roles");
    setStatusFilter("All Status");
  }

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.org.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === "All Roles" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All Status" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const organizationUsers = useMemo(() => {
    return filteredUsers.filter(
      (user) => user.roleRaw === "org_admin" || user.roleRaw === "org_student"
    );
  }, [filteredUsers]);

  const generalStudents = useMemo(() => {
    return filteredUsers.filter((user) => user.roleRaw === "general_user");
  }, [filteredUsers]);

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(
    (user) => user.status === "Active"
  ).length;
  const inactiveUsers = filteredUsers.filter(
    (user) => user.status !== "Active"
  ).length;
  const totalOrgAdmins = filteredUsers.filter(
    (user) => user.roleRaw === "org_admin"
  ).length;
  const totalOrgStudents = filteredUsers.filter(
    (user) => user.roleRaw === "org_student"
  ).length;
  const totalGeneralStudents = filteredUsers.filter(
    (user) => user.roleRaw === "general_user"
  ).length;

  const commonNameColumn = {
    key: "name",
    label: "Name",
    render: (row) => (
      <div className="users-name-cell">
        <UserAvatar name={row.name} />
        <div>
          <p className="users-name-cell__name">{row.name}</p>
          <p className="users-name-cell__meta">{row.phone}</p>
        </div>
      </div>
    ),
  };

  const organizationUserColumns = [
    commonNameColumn,
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span
          className={`users-role-pill ${
            row.role === "Org Admin"
              ? "users-role-pill--admin"
              : "users-role-pill--student"
          }`}
        >
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
    { key: "created", label: "Created" },
  ];

  const generalStudentColumns = [
    commonNameColumn,
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: "created", label: "Created" },
  ];

  return (
    <div className="users-page">
      <PageHeader
        title="Users Management"
        subtitle="View, search, and monitor organization users and general students across the platform."
      />

      {errorMessage && (
        <div className="users-alert users-alert--error">{errorMessage}</div>
      )}

      <div className="users-summary-grid">
        <SummaryCard
          label="Total Users"
          value={loading ? "..." : totalUsers}
          note="Users currently matching the selected filters."
          tone="blue"
        />
        <SummaryCard
          label="Active Users"
          value={loading ? "..." : activeUsers}
          note="Users with active account access."
          tone="green"
        />
        <SummaryCard
          label="Org Admins"
          value={loading ? "..." : totalOrgAdmins}
          note="Organization-level admin accounts."
          tone="indigo"
        />
        <SummaryCard
          label="Org Students"
          value={loading ? "..." : totalOrgStudents}
          note="Students inside organizations."
          tone="amber"
        />
        <SummaryCard
          label="General Students"
          value={loading ? "..." : totalGeneralStudents}
          note="Students outside organizations."
          tone="slate"
        />
        <SummaryCard
          label="Inactive / Pending"
          value={loading ? "..." : inactiveUsers}
          note="Accounts not currently active."
          tone="rose"
        />
      </div>

      <div className="users-toolbar-card">
        <div className="users-toolbar">
          <div className="users-toolbar__search">
            <label className="users-toolbar__label">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, organization, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="users-toolbar__input"
            />
          </div>

          <div className="users-toolbar__filter">
            <label className="users-toolbar__label">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="users-toolbar__select"
            >
              <option>All Roles</option>
              <option>Org Admin</option>
              <option>Org Student</option>
              <option>General Student</option>
            </select>
          </div>

          <div className="users-toolbar__filter">
            <label className="users-toolbar__label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="users-toolbar__select"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="users-toolbar__actions">
            <button
              onClick={clearFilters}
              className="users-secondary-btn"
              type="button"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="users-toolbar__meta">
          Showing <strong>{filteredUsers.length}</strong> user(s)
        </div>
      </div>

      {loading ? (
        <div className="users-panel">
          <div className="users-loading-text">Loading users...</div>
        </div>
      ) : (
        <>
          <SectionTable
            title="Organization Users"
            subtitle="Organization admins and organization students"
            columns={organizationUserColumns}
            rows={organizationUsers}
            emptyMessage="No organization users found."
          />

          <SectionTable
            title="General Students"
            subtitle="Students outside organizations"
            columns={generalStudentColumns}
            rows={generalStudents}
            emptyMessage="No general students found."
          />
        </>
      )}
    </div>
  );
}