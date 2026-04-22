import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/organizations.css";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";

const EMPTY_ORG_FORM = {
  name: "",
  industry: "",
};

const EMPTY_ADMIN_FORM = {
  full_name: "",
  email: "",
  password: "",
};

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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`org-summary-card org-summary-card--${tone}`}>
      <p className="org-summary-card__label">{label}</p>
      <h3 className="org-summary-card__value">{value}</h3>
      <p className="org-summary-card__note">{note}</p>
    </div>
  );
}

export default function Organizations() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [createOpen, setCreateOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [orgForm, setOrgForm] = useState(EMPTY_ORG_FORM);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);

  const [selectedOrg, setSelectedOrg] = useState(null);

  const [submittingOrg, setSubmittingOrg] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [togglingOrgId, setTogglingOrgId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get("/organizations/superadmin/all");
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

      setOrganizations(
        rows.map((row) => ({
          id: row.id,
          name: row.name || "Organization",
          industry: row.industry || "-",
          status: normalizeStatus(row.status),
          created: formatDate(row.created_at),
          total_org_admins: Number(row.total_org_admins || 0),
          total_students: Number(row.total_students || 0),
        }))
      );
    } catch (error) {
      console.error("Get organizations error:", error);
      setOrganizations([]);
      setErrorMessage(
        error?.response?.data?.error || "Failed to load organizations"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetOrgModal() {
    setCreateOpen(false);
    setOrgForm(EMPTY_ORG_FORM);
  }

  function resetAdminModal() {
    setAdminOpen(false);
    setAdminForm(EMPTY_ADMIN_FORM);
    setSelectedOrg(null);
  }

  async function handleCreateOrganization() {
    try {
      setSubmittingOrg(true);
      setErrorMessage("");
      setSuccessMessage("");

      const trimmedName = orgForm.name.trim();
      const trimmedIndustry = orgForm.industry.trim();

      if (!trimmedName) {
        setErrorMessage("Organization name is required.");
        return;
      }

      if (trimmedName.length < 3) {
        setErrorMessage("Organization name must be at least 3 characters.");
        return;
      }

      if (trimmedIndustry && trimmedIndustry.length < 2) {
        setErrorMessage("Industry must be at least 2 characters.");
        return;
      }

      await api.post("/organizations/create", {
        name: trimmedName,
        industry: trimmedIndustry,
      });

      setSuccessMessage("Organization created successfully.");
      resetOrgModal();
      await fetchOrganizations();
    } catch (error) {
      console.error("Create organization error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to create organization"
      );
    } finally {
      setSubmittingOrg(false);
    }
  }

  async function handleCreateAdmin() {
    try {
      setSubmittingAdmin(true);
      setErrorMessage("");
      setSuccessMessage("");

      const fullName = adminForm.full_name.trim();
      const email = adminForm.email.trim();
      const password = adminForm.password;

      if (!selectedOrg?.id) {
        setErrorMessage("Please select an organization.");
        return;
      }

      if (selectedOrg.status !== "Active") {
        setErrorMessage("Cannot create admin for inactive organization.");
        return;
      }

      if (!fullName || !email || !password) {
        setErrorMessage("Full name, email and password are required.");
        return;
      }

      if (fullName.length < 3) {
        setErrorMessage("Admin full name must be at least 3 characters.");
        return;
      }

      if (!isValidEmail(email)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }

      await api.post("/organizations/create-admin", {
        full_name: fullName,
        email,
        password,
        organization_id: selectedOrg.id,
      });

      setSuccessMessage("Organization admin created successfully.");
      resetAdminModal();
      await fetchOrganizations();
    } catch (error) {
      console.error("Create organization admin error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to create organization admin"
      );
    } finally {
      setSubmittingAdmin(false);
    }
  }

  async function handleToggleOrganizationStatus(row) {
    const isActive = row.status === "Active";

    const confirmed = window.confirm(
      isActive
        ? `Deactivate organization "${row.name}"?\n\nThis will also deactivate its org admins and org students.`
        : `Activate organization "${row.name}"?\n\nThis will also reactivate its org admins and org students.`
    );

    if (!confirmed) return;

    try {
      setTogglingOrgId(row.id);
      setErrorMessage("");
      setSuccessMessage("");

      await api.put(`/organizations/superadmin/${row.id}/status`);

      setSuccessMessage(
        isActive
          ? "Organization deactivated successfully."
          : "Organization activated successfully."
      );

      await fetchOrganizations();
    } catch (error) {
      console.error("Toggle organization status error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to update organization status"
      );
    } finally {
      setTogglingOrgId(null);
    }
  }

  function handleClearFilters() {
    setSearch("");
    setStatusFilter("All Status");
  }

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const term = search.toLowerCase().trim();

      const matchesSearch =
        org.name.toLowerCase().includes(term) ||
        org.industry.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All Status" || org.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [organizations, search, statusFilter]);

  const summary = useMemo(() => {
    const totalOrganizations = organizations.length;
    const activeOrganizations = organizations.filter(
      (org) => org.status === "Active"
    ).length;
    const totalOrgAdmins = organizations.reduce(
      (sum, org) => sum + Number(org.total_org_admins || 0),
      0
    );
    const totalStudents = organizations.reduce(
      (sum, org) => sum + Number(org.total_students || 0),
      0
    );

    return {
      totalOrganizations,
      activeOrganizations,
      totalOrgAdmins,
      totalStudents,
    };
  }, [organizations]);

  const columns = [
    {
      key: "name",
      label: "Organization Name",
      render: (row) => (
        <div className="org-name-cell">
          <p className="org-name-cell__title">{row.name}</p>
          <p className="org-name-cell__meta">
            {row.total_org_admins} admin(s) • {row.total_students} student(s)
          </p>
        </div>
      ),
    },
    { key: "industry", label: "Industry" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: "created", label: "Created Date" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const isActive = row.status === "Active";
        const isBusy = togglingOrgId === row.id;

        return (
          <div className="org-actions">
            <button
              onClick={() => navigate(`/superadmin/organizations/${row.id}`)}
              className="org-action-btn org-action-btn--view"
              type="button"
            >
              View
            </button>

            <button
              onClick={() => {
                setSelectedOrg(row);
                setAdminForm(EMPTY_ADMIN_FORM);
                setErrorMessage("");
                setSuccessMessage("");
                setAdminOpen(true);
              }}
              disabled={!isActive}
              className={`org-action-btn org-action-btn--admin ${
                !isActive ? "org-action-btn--disabled" : ""
              }`}
              type="button"
            >
              + Admin
            </button>

            <button
              onClick={() => handleToggleOrganizationStatus(row)}
              disabled={isBusy}
              className={`org-action-btn ${
                isActive
                  ? "org-action-btn--danger"
                  : "org-action-btn--success"
              } ${isBusy ? "org-action-btn--disabled" : ""}`}
              type="button"
            >
              {isBusy ? "Updating..." : isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="org-page">
      <PageHeader
        title="Organizations"
        subtitle="Manage organizations, create org admins, and control organization access across the platform."
        action={
          <button
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setCreateOpen(true);
            }}
            className="org-primary-btn"
            type="button"
          >
            <span>+</span> Create Organization
          </button>
        }
      />

      {errorMessage && <div className="org-alert org-alert--error">{errorMessage}</div>}

      {successMessage && (
        <div className="org-alert org-alert--success">{successMessage}</div>
      )}

      <div className="org-summary-grid">
        <SummaryCard
          label="Total Organizations"
          value={loading ? "..." : summary.totalOrganizations}
          note="All registered organizations on the platform."
          tone="blue"
        />
        <SummaryCard
          label="Active Organizations"
          value={loading ? "..." : summary.activeOrganizations}
          note="Organizations currently active and usable."
          tone="green"
        />
        <SummaryCard
          label="Org Admins"
          value={loading ? "..." : summary.totalOrgAdmins}
          note="Total organization administrators."
          tone="indigo"
        />
        <SummaryCard
          label="Org Students"
          value={loading ? "..." : summary.totalStudents}
          note="Students managed under organizations."
          tone="amber"
        />
      </div>

      <div className="org-toolbar-card">
        <div className="org-toolbar">
          <div className="org-toolbar__search">
            <label className="org-toolbar__label">Search</label>
            <input
              type="text"
              placeholder="Search by organization name or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="org-toolbar__input"
            />
          </div>

          <div className="org-toolbar__filter">
            <label className="org-toolbar__label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="org-toolbar__select"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="org-toolbar__actions">
            <button
              onClick={handleClearFilters}
              className="org-secondary-btn"
              type="button"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="org-toolbar__meta">
          <span>
            Showing <strong>{filteredOrganizations.length}</strong> organization(s)
          </span>
        </div>
      </div>

      <div className="org-table-card">
        {loading ? (
          <div className="org-loading-text">Loading organizations...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrganizations}
            emptyMessage="No organizations found."
          />
        )}
      </div>

      <Modal
        isOpen={createOpen}
        onClose={resetOrgModal}
        title="Create Organization"
      >
        <div className="org-modal-form">
          <div className="org-form-group">
            <label className="org-form-label">Organization Name</label>
            <input
              type="text"
              placeholder="e.g. TechCorp Nepal"
              value={orgForm.name}
              onChange={(e) =>
                setOrgForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="org-form-input"
            />
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Industry</label>
            <input
              type="text"
              placeholder="e.g. Technology"
              value={orgForm.industry}
              onChange={(e) =>
                setOrgForm((prev) => ({ ...prev, industry: e.target.value }))
              }
              className="org-form-input"
            />
          </div>

          <div className="org-modal-actions">
            <button
              onClick={handleCreateOrganization}
              disabled={submittingOrg}
              className={`org-modal-btn org-modal-btn--primary ${
                submittingOrg ? "org-modal-btn--disabled" : ""
              }`}
              type="button"
            >
              {submittingOrg ? "Creating..." : "Create Organization"}
            </button>

            <button
              onClick={resetOrgModal}
              disabled={submittingOrg}
              className="org-modal-btn org-modal-btn--secondary"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={adminOpen}
        onClose={resetAdminModal}
        title={`Create Admin — ${selectedOrg?.name || ""}`}
      >
        <div className="org-modal-form">
          {selectedOrg?.status !== "Active" && (
            <div className="org-alert org-alert--warning">
              This organization is not active. Activate it first to create an
              org admin.
            </div>
          )}

          <div className="org-form-group">
            <label className="org-form-label">Admin Full Name</label>
            <input
              type="text"
              placeholder="e.g. Priya Thapa"
              value={adminForm.full_name}
              onChange={(e) =>
                setAdminForm((prev) => ({
                  ...prev,
                  full_name: e.target.value,
                }))
              }
              className="org-form-input"
            />
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Admin Email</label>
            <input
              type="email"
              placeholder="e.g. admin@org.np"
              value={adminForm.email}
              onChange={(e) =>
                setAdminForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              className="org-form-input"
            />
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={adminForm.password}
              onChange={(e) =>
                setAdminForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className="org-form-input"
            />
          </div>

          <div className="org-modal-actions">
            <button
              onClick={handleCreateAdmin}
              disabled={submittingAdmin || selectedOrg?.status !== "Active"}
              className={`org-modal-btn org-modal-btn--primary ${
                submittingAdmin || selectedOrg?.status !== "Active"
                  ? "org-modal-btn--disabled"
                  : ""
              }`}
              type="button"
            >
              {submittingAdmin ? "Creating..." : "Create Admin"}
            </button>

            <button
              onClick={resetAdminModal}
              disabled={submittingAdmin}
              className="org-modal-btn org-modal-btn--secondary"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}