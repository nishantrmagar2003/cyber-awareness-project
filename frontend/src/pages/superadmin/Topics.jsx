import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import "../../styles/topics.css";

const EMPTY_FORM = {
  module_id: "",
  title: "",
  description: "",
  explanation_english: "",
  sort_order: 1,
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

function SummaryCard({ label, value, note, tone = "blue" }) {
  return (
    <div className={`sat-summary-card sat-summary-card--${tone}`}>
      <p className="sat-summary-card__label">{label}</p>
      <h3 className="sat-summary-card__value">{value}</h3>
      <p className="sat-summary-card__note">{note}</p>
    </div>
  );
}

function TopicItem({ topic, onEdit, onDelete }) {
  return (
    <div className="sat-topic-card">
      <div className="sat-topic-card__top">
        <div className="sat-topic-card__main">
          <div className="sat-topic-card__header">
            <div className="sat-topic-card__title-wrap">
              <span className="sat-topic-order">{topic.sort_order || 1}</span>
              <h4 className="sat-topic-card__title">{topic.title}</h4>
            </div>
          </div>

          <p className="sat-topic-card__description">
            {topic.description || "No description"}
          </p>

          <div className="sat-topic-card__meta">
            <span>Created: {formatDate(topic.created_at)}</span>
            <span>Topic ID: {topic.id}</span>
          </div>

          <div className="sat-topic-explanation">
            <p className="sat-topic-explanation__label">
              Text Explanation (English)
            </p>
            <p className="sat-topic-explanation__text">
              {topic.explanation_english || "No text explanation added yet"}
            </p>
          </div>
        </div>

        <div className="sat-topic-card__actions">
          <button
            type="button"
            onClick={() => onEdit(topic)}
            className="sat-action-btn sat-action-btn--edit"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(topic)}
            className="sat-action-btn sat-action-btn--delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ModuleTopicBlock({ module, topics, onEditTopic, onDeleteTopic }) {
  return (
    <div className="sat-module-block">
      <div className="sat-module-block__header">
        <div>
          <div className="sat-module-block__title-row">
            <h3 className="sat-module-block__title">{module.title}</h3>
            <span className="sat-module-badge">Premium</span>
            <span className="sat-module-level">
              {formatLevel(module.level)}
            </span>
          </div>

          <p className="sat-module-block__description">
            {module.description || "No description"}
          </p>

          <div className="sat-module-block__meta">
            <span>Module ID: {module.id}</span>
            <span>Topics: {topics.length}</span>
            <span>Level: {formatLevel(module.level)}</span>
          </div>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="sat-empty-box">
          <p className="sat-empty-box__title">No topics yet</p>
          <p className="sat-empty-box__text">
            This premium module exists, but no topics have been added yet.
          </p>
        </div>
      ) : (
        <div className="sat-topic-list">
          {topics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onEdit={onEditTopic}
              onDelete={onDeleteTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Topics() {
  const [premiumModules, setPremiumModules] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Premium Modules");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

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
              module_description: module.description || "",
              module_level: module.level || "basic",
            }));
          } catch (err) {
            console.error(`Failed to load topics for module ${module.id}:`, err);
            return [];
          }
        })
      );

      setTopics(topicResponses.flat());
    } catch (error) {
      console.error("Load topics error:", error);
      setPremiumModules([]);
      setTopics([]);
      setErrorMessage(
        error?.response?.data?.error || "Failed to load premium topics"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetFormState() {
    setCreateOpen(false);
    setEditingTopic(null);
    setForm(EMPTY_FORM);
  }

  function clearFilters() {
    setSearch("");
    setModuleFilter("All Premium Modules");
  }

  function validateForm() {
    if (!editingTopic && !form.module_id) {
      setErrorMessage("Please select a premium module.");
      return false;
    }

    if (!form.title.trim()) {
      setErrorMessage("Topic title is required.");
      return false;
    }

    if (form.title.trim().length < 3) {
      setErrorMessage("Topic title must be at least 3 characters.");
      return false;
    }

    if (form.description.trim().length < 10) {
      setErrorMessage("Description must be at least 10 characters.");
      return false;
    }

    if (!form.explanation_english.trim()) {
      setErrorMessage("Text explanation in English is required.");
      return false;
    }

    if (form.explanation_english.trim().length < 20) {
      setErrorMessage("Text explanation must be at least 20 characters.");
      return false;
    }

    if (Number(form.sort_order) < 1) {
      setErrorMessage("Sort order must be at least 1.");
      return false;
    }

    return true;
  }

  async function handleCreateTopic() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!validateForm()) return;

      await api.post(`/topics/module/${form.module_id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        explanation_english: form.explanation_english.trim(),
        sort_order: Number(form.sort_order) || 1,
      });

      setSuccessMessage("Topic created successfully.");
      resetFormState();
      await fetchData();
    } catch (error) {
      console.error("Create topic error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to create topic"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateTopic() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!editingTopic?.id) {
        setErrorMessage("No topic selected.");
        return;
      }

      if (!validateForm()) return;

      await api.put(`/topics/${editingTopic.id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        explanation_english: form.explanation_english.trim(),
        sort_order: Number(form.sort_order) || 1,
      });

      setSuccessMessage("Topic updated successfully.");
      resetFormState();
      await fetchData();
    } catch (error) {
      console.error("Update topic error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to update topic"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTopic(topic) {
    const confirmed = window.confirm(`Delete topic "${topic.title}"?`);

    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await api.delete(`/topics/${topic.id}`);

      setSuccessMessage("Topic deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Delete topic error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to delete topic"
      );
    }
  }

  function openEditModal(topic) {
    setEditingTopic(topic);
    setCreateOpen(false);

    setForm({
      module_id: topic.module_id || "",
      title: topic.title || "",
      description: topic.description || "",
      explanation_english: topic.explanation_english || "",
      sort_order: topic.sort_order || 1,
    });
  }

  const filteredModulesWithTopics = useMemo(() => {
    const term = search.toLowerCase().trim();

    return premiumModules
      .filter((module) => {
        if (moduleFilter === "All Premium Modules") return true;
        return String(module.id) === String(moduleFilter);
      })
      .map((module) => {
        const moduleTopics = topics
          .filter((topic) => Number(topic.module_id) === Number(module.id))
          .sort(
            (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
          );

        const moduleMatches =
          module.title?.toLowerCase().includes(term) ||
          module.description?.toLowerCase().includes(term);

        const filteredTopics = moduleTopics.filter((topic) => {
          return (
            topic.title?.toLowerCase().includes(term) ||
            topic.description?.toLowerCase().includes(term) ||
            topic.explanation_english?.toLowerCase().includes(term)
          );
        });

        if (!term) {
          return {
            ...module,
            topics: moduleTopics,
          };
        }

        if (moduleMatches) {
          return {
            ...module,
            topics: moduleTopics,
          };
        }

        if (filteredTopics.length > 0) {
          return {
            ...module,
            topics: filteredTopics,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [premiumModules, topics, search, moduleFilter]);

  const totalPremiumModules = premiumModules.length;
  const totalPremiumTopics = topics.length;
  const modulesWithTopics = premiumModules.filter((module) =>
    topics.some((topic) => Number(topic.module_id) === Number(module.id))
  ).length;
  const emptyPremiumModules = totalPremiumModules - modulesWithTopics;

  return (
    <div className="sat-page">
      <PageHeader
        title="Topics Management"
        subtitle="Only premium module topics can be created, edited, and deleted here."
        action={
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setCreateOpen(true);
              setEditingTopic(null);
              setForm(EMPTY_FORM);
            }}
            className="sat-primary-btn"
          >
            Create Topic
          </button>
        }
      />

      {errorMessage && (
        <div className="sat-alert sat-alert--error">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="sat-alert sat-alert--success">{successMessage}</div>
      )}

      <div className="sat-summary-grid">
        <SummaryCard
          label="Premium Modules"
          value={loading ? "..." : totalPremiumModules}
          note="Premium modules available for topic management."
          tone="blue"
        />
        <SummaryCard
          label="Premium Topics"
          value={loading ? "..." : totalPremiumTopics}
          note="Topics currently created inside premium modules."
          tone="indigo"
        />
        <SummaryCard
          label="Modules With Topics"
          value={loading ? "..." : modulesWithTopics}
          note="Premium modules that already contain topic content."
          tone="green"
        />
        <SummaryCard
          label="Empty Premium Modules"
          value={loading ? "..." : emptyPremiumModules}
          note="Premium modules that still need topics."
          tone="amber"
        />
      </div>

      <div className="sat-toolbar-card">
        <div className="sat-toolbar">
          <div className="sat-toolbar__search">
            <label className="sat-toolbar__label">Search</label>
            <input
              type="text"
              placeholder="Search premium modules or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sat-toolbar__input"
            />
          </div>

          <div className="sat-toolbar__filter">
            <label className="sat-toolbar__label">Premium Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="sat-toolbar__select"
            >
              <option>All Premium Modules</option>
              {premiumModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sat-toolbar__actions">
            <button
              type="button"
              onClick={clearFilters}
              className="sat-secondary-btn"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="sat-list-wrap">
        {loading ? (
          <div className="sat-section-card">
            <p className="sat-loading-text">Loading premium topics...</p>
          </div>
        ) : filteredModulesWithTopics.length === 0 ? (
          <div className="sat-section-card">
            <p className="sat-empty-text">No premium modules or topics found.</p>
          </div>
        ) : (
          filteredModulesWithTopics.map((module) => (
            <ModuleTopicBlock
              key={module.id}
              module={module}
              topics={module.topics || []}
              onEditTopic={openEditModal}
              onDeleteTopic={handleDeleteTopic}
            />
          ))
        )}
      </div>

      {(createOpen || editingTopic) && (
        <div className="sat-modal-overlay">
          <div className="sat-modal">
            <h3 className="sat-modal__title">
              {editingTopic ? "Edit Topic" : "Create Topic"}
            </h3>

            <div className="sat-modal__body">
              {!editingTopic && (
                <div>
                  <label className="sat-field-label">Premium Module</label>
                  <select
                    value={form.module_id}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, module_id: e.target.value }))
                    }
                    className="sat-field-input"
                  >
                    <option value="">Select premium module</option>
                    {premiumModules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingTopic && (
                <div>
                  <label className="sat-field-label">Module</label>
                  <input
                    type="text"
                    value={editingTopic.module_title || ""}
                    disabled
                    className="sat-field-input sat-field-input--disabled"
                  />
                </div>
              )}

              <div>
                <label className="sat-field-label">Topic Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="sat-field-input"
                />
              </div>

              <div>
                <label className="sat-field-label">Description</label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="sat-field-textarea"
                />
              </div>

              <div>
                <label className="sat-field-label">
                  Text Explanation (English)
                </label>
                <textarea
                  rows="8"
                  value={form.explanation_english}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      explanation_english: e.target.value,
                    }))
                  }
                  className="sat-field-textarea"
                  placeholder="Write the full English text explanation for this premium topic..."
                />
              </div>

              <div>
                <label className="sat-field-label">Sort Order</label>
                <input
                  type="number"
                  min="1"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sort_order: e.target.value,
                    }))
                  }
                  className="sat-field-input"
                />
              </div>
            </div>

            <div className="sat-modal__actions">
              <button
                type="button"
                onClick={editingTopic ? handleUpdateTopic : handleCreateTopic}
                disabled={submitting}
                className={`sat-primary-btn ${
                  submitting ? "sat-primary-btn--disabled" : ""
                }`}
              >
                {submitting
                  ? editingTopic
                    ? "Updating..."
                    : "Creating..."
                  : editingTopic
                    ? "Update Topic"
                    : "Create Topic"}
              </button>

              <button
                type="button"
                onClick={resetFormState}
                disabled={submitting}
                className="sat-secondary-btn"
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