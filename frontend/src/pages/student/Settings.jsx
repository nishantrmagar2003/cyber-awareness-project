import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/settings.css";

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveUserToLocalStorage(nextUser) {
  const oldUser = safeParseUser();

  const mergedUser = {
    ...oldUser,
    ...nextUser,
  };

  localStorage.setItem("user", JSON.stringify(mergedUser));
}

export default function Settings() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fillProfileForm = (user) => {
    setForm((prev) => ({
      ...prev,
      fullName: user?.full_name || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || user?.phone_number || "",
    }));
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.get("/auth/me");
      const user = response?.data?.data || {};

      fillProfileForm(user);
      saveUserToLocalStorage(user);
    } catch (err) {
      console.error("LOAD PROFILE ERROR:", err);

      const fallbackUser = safeParseUser();
      fillProfileForm(fallbackUser);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRefresh = async () => {
    setForm((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));

    await loadProfile();
  };

  const handleSaveProfile = async () => {
    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return false;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return false;
    }

    try {
      setSavingProfile(true);
      setError("");
      setMessage("");

      const payload = {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };

      const response = await api.put("/auth/me", payload);
      const updatedUser = response?.data?.user || payload;

      fillProfileForm(updatedUser);
      saveUserToLocalStorage(updatedUser);

      setMessage(response?.data?.message || "Profile updated successfully.");
      return true;
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to update profile."
      );
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const wantsPasswordChange =
      form.currentPassword || form.newPassword || form.confirmPassword;

    if (!wantsPasswordChange) {
      return true;
    }

    if (!form.currentPassword.trim()) {
      setError("Current password is required.");
      return false;
    }

    if (!form.newPassword.trim()) {
      setError("New password is required.");
      return false;
    }

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return false;
    }

    if (!form.confirmPassword.trim()) {
      setError("Confirm new password is required.");
      return false;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return false;
    }

    try {
      setChangingPassword(true);
      setError("");
      setMessage("");

      const payload = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      };

      const response = await api.put("/auth/change-password", payload);

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setMessage(response?.data?.message || "Password changed successfully.");
      return true;
    } catch (err) {
      console.error("CHANGE PASSWORD ERROR:", err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to change password."
      );
      return false;
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const profileSaved = await handleSaveProfile();
    if (!profileSaved) return;

    const wantsPasswordChange =
      form.currentPassword || form.newPassword || form.confirmPassword;

    if (wantsPasswordChange) {
      await handleChangePassword();
    }
  };

  return (
    <div className="student-settings-page">
      <div className="student-settings-wrap">
        <section className="student-settings-hero">
          <div className="student-settings-hero__content">
            <p className="student-settings-eyebrow">Account Center</p>
            <h1 className="student-settings-title">Student Settings</h1>
            <p className="student-settings-subtitle">
              Update your personal information and keep your account secure.
            </p>
          </div>
        </section>

        <form onSubmit={handleSave} className="student-settings-card">
          <div className="student-settings-card__intro">
            <h2>Profile Information</h2>
            <p>
              Manage your basic account details and password from one place.
            </p>
          </div>

          {error ? (
            <div className="student-settings-alert student-settings-alert--error">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="student-settings-alert student-settings-alert--success">
              {message}
            </div>
          ) : null}

          <div className="student-settings-grid">
            <label className="student-settings-field">
              <span>Full Name</span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                disabled={loading || savingProfile || changingPassword}
              />
            </label>

            <label className="student-settings-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={loading || savingProfile || changingPassword}
              />
            </label>

            <label className="student-settings-field student-settings-field--full">
              <span>Phone Number</span>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={loading || savingProfile || changingPassword}
              />
            </label>
          </div>

          <div className="student-settings-divider" />

          <div className="student-settings-card__intro">
            <h2>Change Password</h2>
            <p>
              Leave these fields empty if you do not want to change your password.
            </p>
          </div>

          <div className="student-settings-grid">
            <label className="student-settings-field">
              <span>Current Password</span>
              <input
                type="password"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={(e) =>
                  handleChange("currentPassword", e.target.value)
                }
                disabled={loading || savingProfile || changingPassword}
              />
            </label>

            <label className="student-settings-field">
              <span>New Password</span>
              <input
                type="password"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                disabled={loading || savingProfile || changingPassword}
              />
            </label>

            <label className="student-settings-field student-settings-field--full">
              <span>Confirm New Password</span>
              <input
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                disabled={loading || savingProfile || changingPassword}
              />
            </label>
          </div>

          <div className="student-settings-actions">
            <button
              type="submit"
              disabled={loading || savingProfile || changingPassword}
              className="student-settings-btn student-settings-btn--primary"
            >
              {loading
                ? "Loading..."
                : savingProfile || changingPassword
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || savingProfile || changingPassword}
              className="student-settings-btn student-settings-btn--secondary"
            >
              Refresh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}