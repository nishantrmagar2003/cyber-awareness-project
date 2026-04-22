import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/superadmin-modules.css";

const EMPTY_FORM = {
  title: "",
  description: "",
  key_points: "",
  closing_summary: "",
  level: "basic",
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

function formatLevel(level) {
  if (!level) return "-";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function TopicChips({ topics = [] }) {
  if (!topics.length) return null;

  return (
    <div className="sam-topic-chips">
      {topics.map((topic) => (
        <span key={topic.id} className="sam-topic-chip">
          {topic.title}
        </span>
      ))}
    </div>
  );
}

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`sam-summary-card sam-summary-card--${tone}`}>
      <p className="sam-summary-card__label">{label}</p>
      <h3 className="sam-summary-card__value">{value}</h3>
      <p className="sam-summary-card__note">{note}</p>
    </div>
  );
}

function ModuleCard({ module, readOnly = false, onEdit, onDelete }) {
  return (
    <div className={`sam-module-card ${readOnly ? "sam-module-card--static" : ""}`}>
      <div className="sam-module-card__top">
        <div className="sam-module-card__main">
          <div className="sam-module-card__header">
            <h3 className="sam-module-card__title">{module.title}</h3>

            <div className="sam-module-card__badges">
              <StatusBadge status={readOnly ? "Static" : "Premium"} />
              <span className="sam-level-pill">{formatLevel(module.level)}</span>
            </div>
          </div>

          <p className="sam-module-card__description">
            {module.description || "No description"}
          </p>

          {module.key_points && (
            <div className="sam-block sam-block--neutral">
              <p className="sam-block__title">Key Points</p>
              <p className="sam-block__text">{module.key_points}</p>
            </div>
          )}

          {module.closing_summary && (
            <div className="sam-block sam-block--highlight">
              <p className="sam-block__title">Closing Summary</p>
              <p className="sam-block__text">{module.closing_summary}</p>
            </div>
          )}

          <div className="sam-module-card__meta">
            <span>Topics: {module.topics?.length || 0}</span>
            <span>Created: {formatDate(module.created_at)}</span>
          </div>

          <TopicChips topics={module.topics} />
        </div>

        {!readOnly && (
          <div className="sam-module-card__actions">
            <button
              onClick={() => onEdit(module)}
              className="sam-action-btn sam-action-btn--edit"
              type="button"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(module)}
              className="sam-action-btn sam-action-btn--delete"
              type="button"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Modules() {
  const [generalModules, setGeneralModules] = useState([]);
  const [premiumModules, setPremiumModules] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [generalRes, premiumRes] = await Promise.all([
        api.get("/modules/general"),
        api.get("/modules/premium"),
      ]);

      const generalRows = Array.isArray(generalRes?.data?.data)
        ? generalRes.data.data
        : [];

      const premiumRows = Array.isArray(premiumRes?.data?.data)
        ? premiumRes.data.data
        : [];

      setGeneralModules(generalRows);
      setPremiumModules(premiumRows);
    } catch (error) {
      console.error("Load modules error:", error);
      setGeneralModules([]);
      setPremiumModules([]);
      setErrorMessage(
        error?.response?.data?.error || "Failed to load modules"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetFormState() {
    setCreateOpen(false);
    setEditingModule(null);
    setForm(EMPTY_FORM);
  }

  function clearFilters() {
    setSearch("");
    setLevelFilter("All Levels");
  }

  function validateForm() {
    if (!form.title.trim()) {
      setErrorMessage("Module title is required.");
      return false;
    }

    if (form.title.trim().length < 3) {
      setErrorMessage("Module title must be at least 3 characters.");
      return false;
    }

    if (form.description.trim().length < 10) {
      setErrorMessage("Description must be at least 10 characters.");
      return false;
    }

    return true;
  }

  async function handleCreateModule() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!validateForm()) return;

      await api.post("/modules", {
        title: form.title.trim(),
        description: form.description.trim(),
        key_points: form.key_points.trim(),
        closing_summary: form.closing_summary.trim(),
        level: form.level,
        audience_type: "organization",
        is_public: false,
      });

      setSuccessMessage("Premium module created successfully.");
      resetFormState();
      await fetchModules();
    } catch (error) {
      console.error("Create module error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to create module"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateModule() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!editingModule?.id) {
        setErrorMessage("No module selected.");
        return;
      }

      if (!validateForm()) return;

      await api.put(`/modules/${editingModule.id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        key_points: form.key_points.trim(),
        closing_summary: form.closing_summary.trim(),
        level: form.level,
      });

      setSuccessMessage("Premium module updated successfully.");
      resetFormState();
      await fetchModules();
    } catch (error) {
      console.error("Update module error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to update module"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteModule(module) {
    const confirmed = window.confirm(
      `Delete premium module "${module.title}"?`
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/modules/${module.id}`);

      setSuccessMessage("Premium module deleted successfully.");
      await fetchModules();
    } catch (error) {
      console.error("Delete module error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to delete module"
      );
    }
  }

  function openEditModal(module) {
    setEditingModule(module);
    setCreateOpen(false);
    setForm({
      title: module.title || "",
      description: module.description || "",
      key_points: module.key_points || "",
      closing_summary: module.closing_summary || "",
      level: module.level || "basic",
    });
  }

  const filteredGeneralModules = useMemo(() => {
    const term = search.toLowerCase().trim();

    return generalModules.filter((module) => {
      const matchesSearch =
        module.title?.toLowerCase().includes(term) ||
        module.description?.toLowerCase().includes(term);

      const matchesLevel =
        levelFilter === "All Levels" ||
        formatLevel(module.level) === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [generalModules, search, levelFilter]);

  const filteredPremiumModules = useMemo(() => {
    const term = search.toLowerCase().trim();

    return premiumModules.filter((module) => {
      const matchesSearch =
        module.title?.toLowerCase().includes(term) ||
        module.description?.toLowerCase().includes(term) ||
        module.key_points?.toLowerCase().includes(term) ||
        module.closing_summary?.toLowerCase().includes(term);

      const matchesLevel =
        levelFilter === "All Levels" ||
        formatLevel(module.level) === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [premiumModules, search, levelFilter]);

  const totalGeneral = filteredGeneralModules.length;
  const totalPremium = filteredPremiumModules.length;
  const totalTopicsInGeneral = filteredGeneralModules.reduce(
    (sum, module) => sum + Number(module.topics?.length || 0),
    0
  );
  const totalTopicsInPremium = filteredPremiumModules.reduce(
    (sum, module) => sum + Number(module.topics?.length || 0),
    0
  );

  return (
    <div className="sam-page">
      <PageHeader
        title="Modules Management"
        subtitle="General modules remain static. Premium organization modules can be created and managed here."
        action={
          <button
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setCreateOpen(true);
              setEditingModule(null);
              setForm(EMPTY_FORM);
            }}
            className="sam-primary-btn"
            type="button"
          >
            Create Premium Module
          </button>
        }
      />

      {errorMessage && (
        <div className="sam-alert sam-alert--error">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="sam-alert sam-alert--success">{successMessage}</div>
      )}

      <div className="sam-summary-grid">
        <SummaryCard
          label="General Modules"
          value={loading ? "..." : totalGeneral}
          note="Static modules locked from super admin editing."
          tone="blue"
        />
        <SummaryCard
          label="Premium Modules"
          value={loading ? "..." : totalPremium}
          note="Editable modules for organization learning."
          tone="indigo"
        />
        <SummaryCard
          label="General Topics"
          value={loading ? "..." : totalTopicsInGeneral}
          note="Topics already fixed in static general modules."
          tone="green"
        />
        <SummaryCard
          label="Premium Topics"
          value={loading ? "..." : totalTopicsInPremium}
          note="Topics currently inside premium modules."
          tone="amber"
        />
      </div>

      <div className="sam-toolbar-card">
        <div className="sam-toolbar">
          <div className="sam-toolbar__search">
            <label className="sam-toolbar__label">Search</label>
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sam-toolbar__input"
            />
          </div>

          <div className="sam-toolbar__filter">
            <label className="sam-toolbar__label">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="sam-toolbar__select"
            >
              <option>All Levels</option>
              <option>Basic</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="sam-toolbar__actions">
            <button
              onClick={clearFilters}
              className="sam-secondary-btn"
              type="button"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="sam-section-card">
        <div className="sam-section-header">
          <div>
            <h2 className="sam-section-title">General Modules</h2>
            <p className="sam-section-subtitle">
              Static system modules. These cannot be edited or deleted.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="sam-loading-text">Loading general modules...</p>
        ) : filteredGeneralModules.length === 0 ? (
          <p className="sam-empty-text">No general modules found.</p>
        ) : (
          <div className="sam-list">
            {filteredGeneralModules.map((module) => (
              <ModuleCard key={module.id} module={module} readOnly />
            ))}
          </div>
        )}
      </div>

      <div className="sam-section-card">
        <div className="sam-section-header">
          <div>
            <h2 className="sam-section-title">Premium Modules</h2>
            <p className="sam-section-subtitle">
              Premium organization modules managed by super admin.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="sam-loading-text">Loading premium modules...</p>
        ) : filteredPremiumModules.length === 0 ? (
          <p className="sam-empty-text">No premium modules found.</p>
        ) : (
          <div className="sam-list">
            {filteredPremiumModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onEdit={openEditModal}
                onDelete={handleDeleteModule}
              />
            ))}
          </div>
        )}
      </div>

      {(createOpen || editingModule) && (
        <div className="sam-modal-overlay">
          <div className="sam-modal">
            <h3 className="sam-modal__title">
              {editingModule ? "Edit Premium Module" : "Create Premium Module"}
            </h3>

            <div className="sam-modal__body">
              <div>
                <label className="sam-field-label">Module Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="sam-field-input"
                />
              </div>

              <div>
                <label className="sam-field-label">Level</label>
                <select
                  value={form.level}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, level: e.target.value }))
                  }
                  className="sam-field-input"
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="sam-field-label">Intro Description</label>
                <textarea
                  rows="5"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Write the full module introduction here..."
                  className="sam-field-textarea"
                />
              </div>

              <div>
                <label className="sam-field-label">Key Points</label>
                <textarea
                  rows="6"
                  value={form.key_points}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      key_points: e.target.value,
                    }))
                  }
                  placeholder="Write main topic points or summary points here..."
                  className="sam-field-textarea"
                />
              </div>

              <div>
                <label className="sam-field-label">Closing Summary</label>
                <textarea
                  rows="5"
                  value={form.closing_summary}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      closing_summary: e.target.value,
                    }))
                  }
                  placeholder="Write the final module conclusion here..."
                  className="sam-field-textarea"
                />
              </div>
            </div>

            <div className="sam-modal__actions">
              <button
                onClick={editingModule ? handleUpdateModule : handleCreateModule}
                disabled={submitting}
                className={`sam-primary-btn ${submitting ? "sam-primary-btn--disabled" : ""}`}
                type="button"
              >
                {submitting
                  ? editingModule
                    ? "Updating..."
                    : "Creating..."
                  : editingModule
                  ? "Update Module"
                  : "Create Module"}
              </button>

              <button
                onClick={resetFormState}
                disabled={submitting}
                className="sam-secondary-btn"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}