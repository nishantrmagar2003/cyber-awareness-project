import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import {
  getSystemSettings,
  updateSystemSettings,
} from "../../services/systemSettings.service";
import "../../styles/systemsettings.css";

const EMPTY_FORM = {
  platform_name: "",
  platform_email: "",
  max_organizations: 100,
  max_students_per_org: 500,
  session_timeout_minutes: 60,
  maintenance_mode: false,
  email_notifications: true,
  two_factor_required: false,
};

export default function SystemSettings() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getSystemSettings();

      setForm({
        platform_name: data?.platform_name || "",
        platform_email: data?.platform_email || "",
        max_organizations: Number(data?.max_organizations || 100),
        max_students_per_org: Number(data?.max_students_per_org || 500),
        session_timeout_minutes: Number(data?.session_timeout_minutes || 60),
        maintenance_mode: Number(data?.maintenance_mode) === 1,
        email_notifications: Number(data?.email_notifications) === 1,
        two_factor_required: Number(data?.two_factor_required) === 1,
      });
    } catch (error) {
      console.error("Load system settings error:", error);
      setErrorMessage("Failed to load system settings");
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    if (!form.platform_name.trim()) {
      setErrorMessage("Platform name is required.");
      return false;
    }

    if (!form.platform_email.trim()) {
      setErrorMessage("Platform email is required.");
      return false;
    }

    if (Number(form.max_organizations) < 1) {
      setErrorMessage("Max organizations must be at least 1.");
      return false;
    }

    if (Number(form.max_students_per_org) < 1) {
      setErrorMessage("Max students per org must be at least 1.");
      return false;
    }

    if (Number(form.session_timeout_minutes) < 1) {
      setErrorMessage("Session timeout must be at least 1 minute.");
      return false;
    }

    return true;
  }

  async function handleSave() {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!validateForm()) return;

      await updateSystemSettings({
        platform_name: form.platform_name.trim(),
        platform_email: form.platform_email.trim(),
        max_organizations: Number(form.max_organizations),
        max_students_per_org: Number(form.max_students_per_org),
        session_timeout_minutes: Number(form.session_timeout_minutes),
        maintenance_mode: form.maintenance_mode,
        email_notifications: form.email_notifications,
        two_factor_required: form.two_factor_required,
      });

      setSuccessMessage("System settings updated successfully.");
      await loadSettings();
    } catch (error) {
      console.error("Save system settings error:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to save system settings"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="sys-page">
        <div className="sys-section">
          <p className="sys-loading-text">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sys-page">
      <PageHeader
        title="System Settings"
        subtitle="Manage platform-wide settings for the cyber awareness system"
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            className="sys-primary-btn"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        }
      />

      {errorMessage && (
        <div className="sys-alert sys-alert--error">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="sys-alert sys-alert--success">{successMessage}</div>
      )}

      <div className="sys-grid">
        <section className="sys-section">
          <div className="sys-section__header">
            <h2 className="sys-section__title">Platform Settings</h2>
            <p className="sys-section__desc">
              Update the basic platform identity and contact information.
            </p>
          </div>

          <div className="sys-form-group">
            <label className="sys-label">Platform Name</label>
            <input
              type="text"
              value={form.platform_name}
              onChange={(e) =>
                setForm({ ...form, platform_name: e.target.value })
              }
              className="sys-input"
              placeholder="Cyber Aware Nepal"
            />
          </div>

          <div className="sys-form-group">
            <label className="sys-label">Platform Email</label>
            <input
              type="email"
              value={form.platform_email}
              onChange={(e) =>
                setForm({ ...form, platform_email: e.target.value })
              }
              className="sys-input"
              placeholder="admin@cyber.np"
            />
          </div>
        </section>

        <section className="sys-section">
          <div className="sys-section__header">
            <h2 className="sys-section__title">Usage Limits</h2>
            <p className="sys-section__desc">
              Control how many organizations and students the platform supports.
            </p>
          </div>

          <div className="sys-form-group">
            <label className="sys-label">Max Organizations</label>
            <input
              type="number"
              min="1"
              value={form.max_organizations}
              onChange={(e) =>
                setForm({ ...form, max_organizations: e.target.value })
              }
              className="sys-input"
            />
          </div>

          <div className="sys-form-group">
            <label className="sys-label">Max Students Per Organization</label>
            <input
              type="number"
              min="1"
              value={form.max_students_per_org}
              onChange={(e) =>
                setForm({ ...form, max_students_per_org: e.target.value })
              }
              className="sys-input"
            />
          </div>

          <div className="sys-form-group">
            <label className="sys-label">Session Timeout (Minutes)</label>
            <input
              type="number"
              min="1"
              value={form.session_timeout_minutes}
              onChange={(e) =>
                setForm({ ...form, session_timeout_minutes: e.target.value })
              }
              className="sys-input"
            />
          </div>
        </section>
      </div>
    </div>
  );
}