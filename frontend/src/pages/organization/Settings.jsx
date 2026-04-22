import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../services/api";
import "../../styles/org-settings.css";

function Field({ label, children }) {
  return (
    <div className="os-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="os-input"
    />
  );
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function isValidPhone(phone) {
  if (!phone) return true;
  return /^[0-9+\-\s()]+$/.test(phone) && phone.length <= 20;
}

export default function OrgSettings() {
  const [loading, setLoading] = useState(true);

  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [passError, setPassError] = useState("");

  const [savingOrg, setSavingOrg] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [org, setOrg] = useState({
    name: "",
    industry: "",
    email: "",
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [pass, setPass] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        setPassError("");
        setSaved("");

        const res = await api.get("/organizations/settings");
        const data = res?.data?.data || {};

        if (cancelled) return;

        setOrg({
          name: data?.organization?.name || "",
          industry: data?.organization?.industry || "Technology",
          email: data?.organization?.email || "",
        });

        setProfile({
          name: data?.profile?.name || "",
          email: data?.profile?.email || "",
          phone: data?.profile?.phone || "",
        });
      } catch (err) {
        console.error("ORG SETTINGS LOAD ERROR:", err);

        if (!cancelled) {
          setError(err?.response?.data?.error || "Failed to load settings.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const showSavedMessage = (label) => {
    setSaved(label);
    setTimeout(() => {
      setSaved("");
    }, 3000);
  };

  const saveOrganization = async () => {
    try {
      setError("");
      setPassError("");
      setSaved("");

      if (!org.name.trim()) {
        setError("Organization name is required.");
        return;
      }

      if (!org.email.trim()) {
        setError("Contact email is required.");
        return;
      }

      if (!isValidEmail(org.email.trim())) {
        setError("Enter a valid contact email.");
        return;
      }

      setSavingOrg(true);

      await api.put("/organizations/settings/organization", {
        name: org.name.trim(),
        industry: org.industry.trim(),
        email: org.email.trim(),
      });

      setOrg((prev) => ({
        ...prev,
        name: prev.name.trim(),
        email: prev.email.trim(),
      }));

      setProfile((prev) => ({
        ...prev,
        email: org.email.trim(),
      }));

      showSavedMessage("Organization");
    } catch (err) {
      console.error("SAVE ORG SETTINGS ERROR:", err);
      setError(
        err?.response?.data?.error || "Failed to save organization settings."
      );
    } finally {
      setSavingOrg(false);
    }
  };

  const saveProfile = async () => {
    try {
      setError("");
      setPassError("");
      setSaved("");

      if (!profile.name.trim()) {
        setError("Full name is required.");
        return;
      }

      if (!profile.email.trim()) {
        setError("Email is required.");
        return;
      }

      if (!isValidEmail(profile.email.trim())) {
        setError("Enter a valid email address.");
        return;
      }

      if (!isValidPhone(profile.phone.trim())) {
        setError("Enter a valid phone number.");
        return;
      }

      setSavingProfile(true);

      await api.put("/organizations/settings/profile", {
        full_name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim() || null,
      });

      setProfile((prev) => ({
        ...prev,
        name: prev.name.trim(),
        email: prev.email.trim(),
        phone: prev.phone.trim(),
      }));

      showSavedMessage("Profile");
    } catch (err) {
      console.error("SAVE PROFILE ERROR:", err);
      setError(err?.response?.data?.error || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassChange = async () => {
    try {
      setPassError("");
      setError("");
      setSaved("");

      if (!profile.name.trim()) {
        setPassError("Profile name is required.");
        return;
      }

      if (!profile.email.trim()) {
        setPassError("Profile email is required.");
        return;
      }

      if (!isValidEmail(profile.email.trim())) {
        setPassError("Enter a valid profile email.");
        return;
      }

      if (!isValidPhone(profile.phone.trim())) {
        setPassError("Enter a valid phone number.");
        return;
      }

      if (!pass.current.trim()) {
        setPassError("Enter your current password.");
        return;
      }

      if (pass.newPass.length < 6) {
        setPassError("New password must be at least 6 characters.");
        return;
      }

      if (pass.newPass !== pass.confirm) {
        setPassError("Passwords do not match.");
        return;
      }

      if (pass.current === pass.newPass) {
        setPassError("New password must be different from current password.");
        return;
      }

      setSavingPassword(true);

      await api.put("/organizations/settings/profile", {
        full_name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim() || null,
        current_password: pass.current,
        new_password: pass.newPass,
      });

      setPass({
        current: "",
        newPass: "",
        confirm: "",
      });

      showSavedMessage("Password");
    } catch (err) {
      console.error("UPDATE PASSWORD ERROR:", err);
      setPassError(err?.response?.data?.error || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="os-page">Loading settings...</div>;
  }

  return (
    <div className="os-page">
      <div className="os-page__header">
        <PageHeader
          title="Settings"
          subtitle="Manage your organization and account settings"
        />
      </div>

      <section className="os-hero">
        <div className="os-hero__content">
          <div>
            <p className="os-hero__eyebrow">Organization Settings</p>
            <h2 className="os-hero__title">Manage Account & Organization</h2>
            <p className="os-hero__subtitle">
              Update organization information, admin profile, and password
              settings from one place.
            </p>
          </div>

          <div className="os-hero__badge">
            <span className="os-hero__badge-label">Admin Panel</span>
            <strong className="os-hero__badge-value">
              Organization Admin
            </strong>
          </div>
        </div>
      </section>

      {saved && (
        <div className="os-alert os-alert--success">
          <span>✅</span>
          <span>{saved} settings saved successfully.</span>
        </div>
      )}

      {error && <div className="os-alert os-alert--error">{error}</div>}

      <section className="os-card">
        <div className="os-card__head">
          <h2 className="os-card__title">Organization Information</h2>
          <p className="os-card__subtitle">
            Update your organization's profile details
          </p>
        </div>

        <div className="os-grid">
          <Field label="Organization Name">
            <Input
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              placeholder="Organization name"
              disabled={savingOrg}
            />
          </Field>

          <Field label="Industry">
            <select
              value={org.industry}
              onChange={(e) => setOrg({ ...org, industry: e.target.value })}
              disabled={savingOrg}
              className="os-select"
            >
              {[
                "Technology",
                "Finance",
                "Healthcare",
                "Education",
                "Government",
                "Retail",
                "Manufacturing",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Contact Email">
            <Input
              type="email"
              value={org.email}
              onChange={(e) => setOrg({ ...org, email: e.target.value })}
              placeholder="contact@company.com"
              disabled={savingOrg}
            />
          </Field>
        </div>

        <div className="os-actions">
          <button
            onClick={saveOrganization}
            disabled={savingOrg}
            className={`os-btn ${
              savingOrg
                ? "os-btn--disabled-primary"
                : "os-btn--primary"
            }`}
          >
            {savingOrg ? "Saving..." : "Save Organization"}
          </button>
        </div>
      </section>

      <section className="os-card">
        <div className="os-card__head">
          <h2 className="os-card__title">Admin Profile</h2>
          <p className="os-card__subtitle">
            Update your personal profile information
          </p>
        </div>

        <div className="os-grid">
          <Field label="Full Name">
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Full name"
              disabled={savingProfile}
            />
          </Field>

          <Field label="Email Address">
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="admin@company.com"
              disabled={savingProfile}
            />
          </Field>

          <Field label="Phone Number">
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="98XXXXXXXX or 01-XXXXXXX"
              disabled={savingProfile}
            />
          </Field>
        </div>

        <div className="os-actions">
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className={`os-btn ${
              savingProfile
                ? "os-btn--disabled-primary"
                : "os-btn--primary"
            }`}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </section>

      <section className="os-card">
        <div className="os-card__head">
          <h2 className="os-card__title">Change Password</h2>
          <p className="os-card__subtitle">
            Keep your account secure with a strong password
          </p>
        </div>

        {passError && <div className="os-inline-error">{passError}</div>}

        <div className="os-grid os-grid--password">
          <Field label="Current Password">
            <Input
              type="password"
              value={pass.current}
              onChange={(e) => setPass({ ...pass, current: e.target.value })}
              placeholder="••••••••"
              disabled={savingPassword}
            />
          </Field>

          <div />

          <Field label="New Password">
            <Input
              type="password"
              value={pass.newPass}
              onChange={(e) => setPass({ ...pass, newPass: e.target.value })}
              placeholder="Min. 6 characters"
              disabled={savingPassword}
            />
          </Field>

          <Field label="Confirm New Password">
            <Input
              type="password"
              value={pass.confirm}
              onChange={(e) => setPass({ ...pass, confirm: e.target.value })}
              placeholder="Repeat new password"
              disabled={savingPassword}
            />
          </Field>
        </div>

        <div className="os-actions">
          <button
            onClick={handlePassChange}
            disabled={savingPassword}
            className={`os-btn ${
              savingPassword ? "os-btn--disabled-dark" : "os-btn--dark"
            }`}
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </section>
    </div>
  );
}