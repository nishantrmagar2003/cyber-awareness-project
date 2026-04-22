import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/organization-details.css";

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

function formatLevel(level) {
  if (!level) return "-";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`orgd-stat-card orgd-stat-card--${tone}`}>
      <p className="orgd-stat-card__label">{label}</p>
      <h3 className="orgd-stat-card__value">{value}</h3>
      <p className="orgd-stat-card__note">{note}</p>
    </div>
  );
}

export default function OrganizationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [organizationData, setOrganizationData] = useState(null);

  const [allPremiumModules, setAllPremiumModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");

  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [detailRes, premiumRes] = await Promise.all([
          api.get(`/organizations/superadmin/${id}`),
          api.get("/organizations/superadmin/premium-modules/all"),
        ]);

        const detailData = detailRes?.data?.data || null;
        const premiumData = Array.isArray(premiumRes?.data?.data)
          ? premiumRes.data.data
          : [];

        if (!cancelled) {
          setOrganizationData(detailData);
          setAllPremiumModules(premiumData);
        }
      } catch (error) {
        console.error("Organization detail error:", error);

        if (!cancelled) {
          setOrganizationData(null);
          setAllPremiumModules([]);
          setErrorMessage(
            error?.response?.data?.error ||
              "Failed to load organization details"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadPage();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function refreshOrganizationDetails() {
    try {
      const res = await api.get(`/organizations/superadmin/${id}`);
      const data = res?.data?.data || null;
      setOrganizationData(data);
    } catch (error) {
      console.error("Refresh organization detail error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to refresh organization details"
      );
    }
  }

  async function handleAssignModule() {
    try {
      setAssigning(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!selectedModuleId) {
        setErrorMessage("Please select a premium module first.");
        return;
      }

      await api.post(`/organizations/superadmin/${id}/modules`, {
        module_id: Number(selectedModuleId),
      });

      setSuccessMessage("Premium module assigned successfully.");
      setSelectedModuleId("");
      await refreshOrganizationDetails();
    } catch (error) {
      console.error("Assign premium module error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to assign premium module"
      );
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemoveModule(moduleId, moduleTitle) {
    const confirmed = window.confirm(
      `Remove "${moduleTitle}" from this organization?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(moduleId);
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/organizations/superadmin/${id}/modules/${moduleId}`);

      setSuccessMessage("Premium module removed successfully.");
      await refreshOrganizationDetails();
    } catch (error) {
      console.error("Remove premium module error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to remove premium module"
      );
    } finally {
      setRemovingId(null);
    }
  }

  const organization = useMemo(() => {
    if (!organizationData?.organization) return null;

    return {
      id: organizationData.organization.id,
      name: organizationData.organization.name || "Organization",
      industry: organizationData.organization.industry || "-",
      status: normalizeStatus(organizationData.organization.status),
      created: formatDate(organizationData.organization.created_at),
    };
  }, [organizationData]);

  const admins = useMemo(() => {
    return Array.isArray(organizationData?.admins) ? organizationData.admins : [];
  }, [organizationData]);

  const students = useMemo(() => {
    return Array.isArray(organizationData?.students)
      ? organizationData.students
      : [];
  }, [organizationData]);

  const premiumModules = useMemo(() => {
    return Array.isArray(organizationData?.premium_modules)
      ? organizationData.premium_modules
      : [];
  }, [organizationData]);

  const assignedModuleIds = useMemo(() => {
    return new Set(premiumModules.map((module) => Number(module.id)));
  }, [premiumModules]);

  const availableModulesForAssign = useMemo(() => {
    return allPremiumModules.filter(
      (module) => !assignedModuleIds.has(Number(module.id))
    );
  }, [allPremiumModules, assignedModuleIds]);

  if (loading) {
    return (
      <div className="orgd-page">
        <div className="text-sm text-slate-500">Loading organization details...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="orgd-page">
        <button
          onClick={() => navigate("/superadmin/organizations")}
          className="orgd-back-btn"
        >
          ← Back to Organizations
        </button>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {errorMessage}
          </div>
        )}

        <div className="orgd-panel">
          <h2 className="text-lg font-bold text-slate-800">
            Organization not found
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Could not load this organization record.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="orgd-page">
      <button
        onClick={() => navigate("/superadmin/organizations")}
        className="orgd-back-btn"
      >
        ← Back to Organizations
      </button>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
          {successMessage}
        </div>
      )}

      <section className="orgd-hero">
        <div className="orgd-hero__left">
          <div className="orgd-hero__avatar">
            {organization.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="orgd-hero__content">
            <div className="orgd-hero__row">
              <h1 className="orgd-hero__title">{organization.name}</h1>
              <StatusBadge status={organization.status} />
            </div>

            <p className="orgd-hero__subtitle">{organization.industry}</p>
            <p className="orgd-hero__meta">Created: {organization.created}</p>
          </div>
        </div>

        <div className="orgd-hero__right">
          <div className="orgd-hero-chip">
            Premium access controlled by Super Admin
          </div>
        </div>
      </section>

      <section className="orgd-stats-grid">
        <SummaryCard
          label="Org Admins"
          value={admins.length}
          note="Organization-level administrators."
          tone="blue"
        />
        <SummaryCard
          label="Students"
          value={students.length}
          note="Students currently under this organization."
          tone="green"
        />
        <SummaryCard
          label="Premium Modules"
          value={premiumModules.length}
          note="Assigned premium modules only."
          tone="indigo"
        />
      </section>

      <section className="orgd-panel">
        <div className="orgd-section-header">
          <div>
            <h2 className="orgd-section-title">Premium Module Assignment</h2>
            <p className="orgd-section-subtitle">
              Assign only the premium modules this organization should access.
            </p>
          </div>

          <div className="orgd-assign-box">
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="orgd-select"
            >
              <option value="">Select premium module</option>
              {availableModulesForAssign.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignModule}
              disabled={assigning || availableModulesForAssign.length === 0}
              className={`orgd-primary-btn ${
                assigning || availableModulesForAssign.length === 0
                  ? "orgd-primary-btn--disabled"
                  : ""
              }`}
            >
              {assigning ? "Assigning..." : "Assign Module"}
            </button>
          </div>
        </div>

        {availableModulesForAssign.length === 0 && (
          <p className="orgd-empty-note">
            All premium modules are already assigned to this organization.
          </p>
        )}
      </section>

      <section className="orgd-panel">
        <div className="orgd-section-header">
          <div>
            <h2 className="orgd-section-title">Assigned Premium Modules</h2>
            <p className="orgd-section-subtitle">
              Premium content currently available for this organization.
            </p>
          </div>
        </div>

        {premiumModules.length === 0 ? (
          <p className="orgd-empty-note">No premium modules assigned.</p>
        ) : (
          <div className="orgd-module-grid">
            {premiumModules.map((module) => (
              <div key={module.id} className="orgd-module-card">
                <div className="orgd-module-card__top">
                  <div className="orgd-module-card__content">
                    <div className="orgd-module-card__title-row">
                      <p className="orgd-module-card__title">
                        {module.title || "Module"}
                      </p>

                      <span className="orgd-module-badge">Premium</span>
                    </div>

                    <p className="orgd-module-card__meta">
                      {module.audience_type || "-"} • Public:{" "}
                      {Number(module.is_public || 0) === 1 ? "Yes" : "No"}
                    </p>

                    {module.description && (
                      <p className="orgd-module-card__description">
                        {module.description}
                      </p>
                    )}

                    {module.level && (
                      <p className="orgd-module-card__level">
                        Level: {formatLevel(module.level)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      handleRemoveModule(module.id, module.title || "Module")
                    }
                    disabled={removingId === module.id}
                    className={`orgd-remove-btn ${
                      removingId === module.id ? "orgd-remove-btn--disabled" : ""
                    }`}
                  >
                    {removingId === module.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="orgd-two-col">
        <div className="orgd-panel">
          <div className="orgd-section-header">
            <div>
              <h2 className="orgd-section-title">Organization Admins</h2>
              <p className="orgd-section-subtitle">
                Admin accounts assigned to this organization.
              </p>
            </div>
          </div>

          {admins.length === 0 ? (
            <p className="orgd-empty-note">No organization admins found.</p>
          ) : (
            <div className="orgd-user-list">
              {admins.map((admin) => (
                <div key={admin.id} className="orgd-user-card">
                  <div className="orgd-user-card__main">
                    <p className="orgd-user-card__name">
                      {admin.full_name || "Admin"}
                    </p>
                    <p className="orgd-user-card__email">{admin.email || "-"}</p>
                    <p className="orgd-user-card__meta">
                      Phone: {admin.phone || "-"} • Joined:{" "}
                      {formatDate(admin.created_at)}
                    </p>
                  </div>

                  <div className="orgd-user-card__status">
                    <StatusBadge status={normalizeStatus(admin.status)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="orgd-panel">
          <div className="orgd-section-header">
            <div>
              <h2 className="orgd-section-title">Organization Students</h2>
              <p className="orgd-section-subtitle">
                Student accounts currently under this organization.
              </p>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="orgd-empty-note">No students found.</p>
          ) : (
            <div className="orgd-student-table-wrap">
              <div className="orgd-student-table-scroll">
                <table className="orgd-student-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.full_name || "Student"}</td>
                        <td>{student.email || "-"}</td>
                        <td>{student.phone || "-"}</td>
                        <td>
                          <StatusBadge status={normalizeStatus(student.status)} />
                        </td>
                        <td>{formatDate(student.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}