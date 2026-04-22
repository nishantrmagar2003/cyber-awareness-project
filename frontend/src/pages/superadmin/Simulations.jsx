import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import "../../styles/simulations.css";

const COMPONENT_KEY_OPTIONS = [
  { value: "password-reuse", label: "Password Reuse" },
  { value: "password-strength", label: "Password Strength" },
  { value: "otp-social-engineering", label: "OTP Social Engineering" },
  { value: "two-fa", label: "Two FA" },
  { value: "oversharing-risk-analyzer", label: "Oversharing Risk Analyzer" },
  { value: "privacy-settings-challenge", label: "Privacy Settings Challenge" },
  { value: "fake-login-trap", label: "Fake Login Trap" },
  { value: "phishing-email-game", label: "Phishing Email Game" },
  { value: "qr-payment-trick", label: "QR Payment Trick" },
  { value: "qr-scam-awareness", label: "QR Scam Awareness" },
  { value: "domain-inspection-challenge", label: "Domain Inspection Challenge" },
  { value: "fake-app-store-listing", label: "Fake App Store Listing" },
  { value: "app-permission-control", label: "App Permission Control" },
  { value: "public-wifi-attack", label: "Public WiFi Attack" },
  { value: "bystander-decision", label: "Bystander Decision" },
  { value: "cyberbullying-response", label: "Cyberbullying Response" },
  { value: "employee-phishing-test", label: "Employee Phishing Test" },
  { value: "usb-drop-attack", label: "USB Drop Attack" },
];

const SIM_TYPE_OPTIONS = [
  "password_strength",
  "password_reuse",
  "login_2fa",
  "otp_social_engineering",
  "oversharing_risk",
  "privacy_settings",
  "phishing_email_detection",
  "fake_login_trap",
  "qr_scan_or_not",
  "qr_payment_trick",
  "domain_inspection",
  "fake_app_listing",
  "app_permissions",
  "public_wifi",
  "cyberbullying_response",
  "bystander_decision",
  "employee_phishing",
  "usb_drop",
];

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

const EMPTY_FORM = {
  module_id: "",
  topic_id: "",
  simulation_no: "1",
  title: "",
  component_key: "",
  sim_type: "password_strength",
  pass_score: 70,
  max_attempts: 3,
  difficulty: "medium",
  is_active: true,
  estimated_time_seconds: 300,
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

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`sas-summary-card sas-summary-card--${tone}`}>
      <p className="sas-summary-card__label">{label}</p>
      <h3 className="sas-summary-card__value">{value}</h3>
      <p className="sas-summary-card__note">{note}</p>
    </div>
  );
}

function SimulationCard({ simulation, onEdit, onDelete }) {
  return (
    <div className="sas-simulation-card">
      <div className="sas-simulation-card__top">
        <div className="sas-simulation-card__main">
          <div className="sas-simulation-card__header">
            <div className="sas-simulation-card__title-wrap">
              <span className="sas-simulation-order">
                S{simulation.simulation_no || "1"}
              </span>
              <h4 className="sas-simulation-card__title">{simulation.title}</h4>
            </div>
          </div>

          <p className="sas-simulation-card__description">
            Topic: <strong>{simulation.topic_title || "-"}</strong>
          </p>

          <div className="sas-simulation-card__meta">
            <span>Module: {simulation.module_title || "-"}</span>
            <span>Simulation No: {simulation.simulation_no || 1}</span>
            <span>Key: {simulation.component_key || "-"}</span>
            <span>Type: {simulation.sim_type || "-"}</span>
            <span>Difficulty: {simulation.difficulty || "-"}</span>
            <span>Pass Score: {simulation.pass_score}</span>
            <span>Attempts: {simulation.max_attempts}</span>
            <span>Time: {simulation.estimated_time_seconds}s</span>
            <span>
              Status: {Number(simulation.is_active) === 1 ? "Active" : "Inactive"}
            </span>
            <span>Created: {formatDate(simulation.created_at)}</span>
          </div>
        </div>

        <div className="sas-simulation-card__actions">
          <button
            onClick={() => onEdit(simulation)}
            className="sas-action-btn sas-action-btn--edit"
            type="button"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(simulation)}
            className="sas-action-btn sas-action-btn--delete"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ModuleSimulationBlock({ module, simulations, onEdit, onDelete }) {
  return (
    <div className="sas-module-block">
      <div className="sas-module-block__header">
        <div>
          <div className="sas-module-block__title-row">
            <h3 className="sas-module-block__title">{module.title}</h3>
            <span className="sas-module-badge">Premium Module</span>
            <span className="sas-module-level">{module.level || "-"}</span>
          </div>

          <p className="sas-module-block__description">
            {module.description || "No description"}
          </p>

          <div className="sas-module-block__meta">
            <span>Module ID: {module.id}</span>
            <span>Simulations: {simulations.length}</span>
          </div>
        </div>
      </div>

      {simulations.length === 0 ? (
        <div className="sas-empty-box">
          <p className="sas-empty-box__title">No simulations yet</p>
          <p className="sas-empty-box__text">
            This premium module has no simulations assigned yet.
          </p>
        </div>
      ) : (
        <div className="sas-simulation-list">
          {simulations.map((simulation) => (
            <SimulationCard
              key={simulation.id}
              simulation={simulation}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Simulations() {
  const [premiumModules, setPremiumModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [simulations, setSimulations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Premium Modules");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingSimulation, setEditingSimulation] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTopicsForForm = useMemo(() => {
    if (!form.module_id) return [];
    return topics.filter(
      (topic) => String(topic.module_id) === String(form.module_id)
    );
  }, [topics, form.module_id]);

  async function fetchData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const premiumRes = await api.get("/modules/premium");
      const premiumRows = Array.isArray(premiumRes?.data?.data)
        ? premiumRes.data.data
        : [];

      setPremiumModules(premiumRows);

      const topicResponses = await Promise.all(
        premiumRows.map(async (module) => {
          try {
            const res = await api.get(`/topics/module/${module.id}`);
            const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

            return rows.map((topic) => ({
              ...topic,
              module_id: module.id,
              module_title: module.title,
            }));
          } catch (err) {
            console.error(`Failed to load topics for module ${module.id}:`, err);
            return [];
          }
        })
      );

      const allTopics = topicResponses.flat();
      setTopics(allTopics);

      const simRes = await api.get("/simulations/admin");
      const simRows = Array.isArray(simRes?.data?.data) ? simRes.data.data : [];

      const mergedSimulations = simRows.map((simulation) => {
        const topic = allTopics.find(
          (t) => String(t.id) === String(simulation.topic_id)
        );

        const module = premiumRows.find(
          (m) => String(m.id) === String(topic?.module_id || simulation.module_id)
        );

        return {
          ...simulation,
          topic_title: simulation.topic_title || topic?.title || "-",
          module_id: simulation.module_id || topic?.module_id || "",
          module_title: simulation.module_title || module?.title || "-",
        };
      });

      setSimulations(
        mergedSimulations.sort(
          (a, b) =>
            Number(a.module_id || 0) - Number(b.module_id || 0) ||
            Number(a.topic_id || 0) - Number(b.topic_id || 0) ||
            Number(a.simulation_no || 0) - Number(b.simulation_no || 0) ||
            Number(a.id || 0) - Number(b.id || 0)
        )
      );
    } catch (error) {
      console.error("Load simulations error:", error);
      setPremiumModules([]);
      setTopics([]);
      setSimulations([]);
      setErrorMessage(
        error?.response?.data?.error || "Failed to load simulations"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetFormState() {
    setCreateOpen(false);
    setEditingSimulation(null);
    setForm(EMPTY_FORM);
  }

  function clearFilters() {
    setSearch("");
    setModuleFilter("All Premium Modules");
  }

  function validateForm() {
    if (!form.module_id) {
      setErrorMessage("Please select a premium module.");
      return false;
    }

    if (!form.topic_id) {
      setErrorMessage("Please select a topic.");
      return false;
    }

    if (!["1", "2"].includes(String(form.simulation_no))) {
      setErrorMessage("Simulation number must be 1 or 2.");
      return false;
    }

    if (!form.title.trim()) {
      setErrorMessage("Simulation title is required.");
      return false;
    }

    if (!form.component_key) {
      setErrorMessage("Please select a component key.");
      return false;
    }

    if (!form.sim_type.trim()) {
      setErrorMessage("Simulation type is required.");
      return false;
    }

    if (Number(form.pass_score) < 1 || Number(form.pass_score) > 100) {
      setErrorMessage("Pass score must be between 1 and 100.");
      return false;
    }

    if (Number(form.max_attempts) < 1 || Number(form.max_attempts) > 10) {
      setErrorMessage("Max attempts must be between 1 and 10.");
      return false;
    }

    if (Number(form.estimated_time_seconds) < 30) {
      setErrorMessage("Estimated time must be at least 30 seconds.");
      return false;
    }

    return true;
  }

  async function handleCreateSimulation() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!validateForm()) return;

      await api.post("/simulations/admin", {
        topic_id: Number(form.topic_id),
        simulation_no: Number(form.simulation_no),
        title: form.title.trim(),
        component_key: form.component_key,
        sim_type: form.sim_type.trim(),
        pass_score: Number(form.pass_score),
        max_attempts: Number(form.max_attempts),
        difficulty: form.difficulty,
        is_active: form.is_active ? 1 : 0,
        estimated_time_seconds: Number(form.estimated_time_seconds),
      });

      setSuccessMessage("Simulation created successfully.");
      resetFormState();
      await fetchData();
    } catch (error) {
      console.error("Create simulation error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to create simulation"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateSimulation() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!editingSimulation?.id) {
        setErrorMessage("No simulation selected.");
        return;
      }

      if (!validateForm()) return;

      await api.put(`/simulations/admin/${editingSimulation.id}`, {
        topic_id: Number(form.topic_id),
        simulation_no: Number(form.simulation_no),
        title: form.title.trim(),
        component_key: form.component_key,
        sim_type: form.sim_type.trim(),
        pass_score: Number(form.pass_score),
        max_attempts: Number(form.max_attempts),
        difficulty: form.difficulty,
        is_active: form.is_active ? 1 : 0,
        estimated_time_seconds: Number(form.estimated_time_seconds),
      });

      setSuccessMessage("Simulation updated successfully.");
      resetFormState();
      await fetchData();
    } catch (error) {
      console.error("Update simulation error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to update simulation"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSimulation(simulation) {
    const confirmed = window.confirm(
      `Delete simulation "${simulation.title}"?`
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/simulations/admin/${simulation.id}`);

      setSuccessMessage("Simulation deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Delete simulation error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to delete simulation"
      );
    }
  }

  function openCreateModal() {
    setErrorMessage("");
    setSuccessMessage("");
    setCreateOpen(true);
    setEditingSimulation(null);
    setForm(EMPTY_FORM);
  }

  function openEditModal(simulation) {
    setErrorMessage("");
    setSuccessMessage("");
    setCreateOpen(false);
    setEditingSimulation(simulation);

    const topic = topics.find(
      (t) => String(t.id) === String(simulation.topic_id)
    );

    setForm({
      module_id: String(topic?.module_id || simulation.module_id || ""),
      topic_id: String(simulation.topic_id || ""),
      simulation_no: String(simulation.simulation_no || 1),
      title: simulation.title || "",
      component_key: simulation.component_key || "",
      sim_type: simulation.sim_type || "password_strength",
      pass_score: Number(simulation.pass_score || 70),
      max_attempts: Number(simulation.max_attempts || 3),
      difficulty: simulation.difficulty || "medium",
      is_active: Number(simulation.is_active) === 1,
      estimated_time_seconds: Number(simulation.estimated_time_seconds || 300),
    });
  }

  const filteredModulesWithSimulations = useMemo(() => {
    const term = search.toLowerCase().trim();

    return premiumModules
      .filter((module) => {
        if (moduleFilter === "All Premium Modules") return true;
        return String(module.id) === String(moduleFilter);
      })
      .map((module) => {
        const moduleSimulations = simulations.filter(
          (simulation) => String(simulation.module_id) === String(module.id)
        );

        const moduleMatches =
          module.title?.toLowerCase().includes(term) ||
          module.description?.toLowerCase().includes(term);

        const filteredSimulations = moduleSimulations.filter((simulation) => {
          return (
            simulation.title?.toLowerCase().includes(term) ||
            simulation.topic_title?.toLowerCase().includes(term) ||
            simulation.component_key?.toLowerCase().includes(term) ||
            simulation.sim_type?.toLowerCase().includes(term) ||
            String(simulation.simulation_no || "").includes(term)
          );
        });

        if (!term) {
          return {
            ...module,
            simulations: moduleSimulations,
          };
        }

        if (moduleMatches) {
          return {
            ...module,
            simulations: moduleSimulations,
          };
        }

        if (filteredSimulations.length > 0) {
          return {
            ...module,
            simulations: filteredSimulations,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [premiumModules, simulations, search, moduleFilter]);

  const totalSimulations = simulations.length;
  const activeSimulations = simulations.filter(
    (simulation) => Number(simulation.is_active) === 1
  ).length;
  const inactiveSimulations = totalSimulations - activeSimulations;
  const usedTopics = new Set(
    simulations.map((simulation) => String(simulation.topic_id))
  ).size;

  return (
    <div className="sas-page">
      <PageHeader
        title="Simulations Management"
        subtitle="Assign practical simulations to premium topics using existing simulation templates."
        action={
          <button onClick={openCreateModal} className="sas-primary-btn">
            Create Simulation
          </button>
        }
      />

      {errorMessage && <div className="sas-alert sas-alert--error">{errorMessage}</div>}

      {successMessage && (
        <div className="sas-alert sas-alert--success">{successMessage}</div>
      )}

      <div className="sas-summary-grid">
        <SummaryCard
          label="Total Simulations"
          value={loading ? "..." : totalSimulations}
          note="Simulation rows currently stored in database."
          tone="blue"
        />
        <SummaryCard
          label="Active Simulations"
          value={loading ? "..." : activeSimulations}
          note="Simulations currently available to students."
          tone="green"
        />
        <SummaryCard
          label="Inactive Simulations"
          value={loading ? "..." : inactiveSimulations}
          note="Disabled simulations not currently available."
          tone="amber"
        />
        <SummaryCard
          label="Topics Covered"
          value={loading ? "..." : usedTopics}
          note="Premium topics that already have simulation assignment."
          tone="indigo"
        />
      </div>

      <div className="sas-toolbar-card">
        <div className="sas-toolbar">
          <div className="sas-toolbar__search">
            <label className="sas-toolbar__label">Search</label>
            <input
              type="text"
              placeholder="Search simulation, topic, module, or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sas-toolbar__input"
            />
          </div>

          <div className="sas-toolbar__filter">
            <label className="sas-toolbar__label">Premium Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="sas-toolbar__select"
            >
              <option>All Premium Modules</option>
              {premiumModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sas-toolbar__actions">
            <button onClick={clearFilters} className="sas-secondary-btn" type="button">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="sas-list-wrap">
        {loading ? (
          <div className="sas-section-card">
            <p className="sas-loading-text">Loading simulations...</p>
          </div>
        ) : filteredModulesWithSimulations.length === 0 ? (
          <div className="sas-section-card">
            <p className="sas-empty-text">No premium simulations found.</p>
          </div>
        ) : (
          filteredModulesWithSimulations.map((module) => (
            <ModuleSimulationBlock
              key={module.id}
              module={module}
              simulations={module.simulations || []}
              onEdit={openEditModal}
              onDelete={handleDeleteSimulation}
            />
          ))
        )}
      </div>

      {(createOpen || editingSimulation) && (
        <div className="sas-modal-overlay">
          <div className="sas-modal">
            <h3 className="sas-modal__title">
              {editingSimulation ? "Edit Simulation" : "Create Simulation"}
            </h3>

            <div className="sas-modal__body">
              <div>
                <label className="sas-field-label">Premium Module</label>
                <select
                  value={form.module_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      module_id: e.target.value,
                      topic_id: "",
                    }))
                  }
                  className="sas-field-input"
                >
                  <option value="">Select premium module</option>
                  {premiumModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sas-field-label">Topic</label>
                <select
                  value={form.topic_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      topic_id: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                  disabled={!form.module_id}
                >
                  <option value="">Select topic</option>
                  {filteredTopicsForForm.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sas-field-label">Simulation Number</label>
                <select
                  value={form.simulation_no}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      simulation_no: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                >
                  <option value="1">Simulation 1</option>
                  <option value="2">Simulation 2</option>
                </select>
              </div>

              <div>
                <label className="sas-field-label">Simulation Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                />
              </div>

              <div>
                <label className="sas-field-label">Component Key</label>
                <select
                  value={form.component_key}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      component_key: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                >
                  <option value="">Select component key</option>
                  {COMPONENT_KEY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} ({item.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sas-field-label">Simulation Type</label>
                <select
                  value={form.sim_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sim_type: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                >
                  {SIM_TYPE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sas-field-label">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                >
                  {DIFFICULTY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sas-field-label">Pass Score</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.pass_score}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pass_score: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                />
              </div>

              <div>
                <label className="sas-field-label">Max Attempts</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.max_attempts}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      max_attempts: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                />
              </div>

              <div>
                <label className="sas-field-label">Estimated Time (seconds)</label>
                <input
                  type="number"
                  min="30"
                  value={form.estimated_time_seconds}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      estimated_time_seconds: e.target.value,
                    }))
                  }
                  className="sas-field-input"
                />
              </div>

              <div>
                <label className="sas-field-label">Status</label>
                <select
                  value={form.is_active ? "1" : "0"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: e.target.value === "1",
                    }))
                  }
                  className="sas-field-input"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>

            <div className="sas-modal__actions">
              <button
                onClick={
                  editingSimulation
                    ? handleUpdateSimulation
                    : handleCreateSimulation
                }
                disabled={submitting}
                className={`sas-primary-btn ${
                  submitting ? "sas-primary-btn--disabled" : ""
                }`}
                type="button"
              >
                {submitting
                  ? editingSimulation
                    ? "Updating..."
                    : "Creating..."
                  : editingSimulation
                  ? "Update Simulation"
                  : "Create Simulation"}
              </button>

              <button
                onClick={resetFormState}
                disabled={submitting}
                className="sas-secondary-btn"
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