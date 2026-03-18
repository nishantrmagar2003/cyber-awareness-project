import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import "../../styles/systemsettings.css";

export default function SystemSettings() {
  const [saved, setSaved]   = useState(false);
  const [config, setConfig] = useState({
    platformName:    "CyberAware Nepal",
    platformEmail:   "admin@cyberaware.np",
    maxOrgs:         "100",
    maxStudentsPerOrg: "500",
    sessionTimeout:  "60",
    maintenanceMode: false,
    emailNotifications: true,
    twoFactorRequired:  false,
  });

  const handleSave = () => {
    // axios.put("/api/settings", config).then(() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Field = ({ label, desc, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-5 border-b border-slate-100 last:border-0">
      <div className="sm:w-64 flex-shrink-0">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  const Input = ({ name, type = "text" }) => (
    <input
      type={type}
      value={config[name]}
      onChange={(e) => setConfig({ ...config, [name]: e.target.value })}
      className="w-full sm:max-w-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
    />
  );

  const Toggle = ({ name }) => (
    <button
      onClick={() => setConfig({ ...config, [name]: !config[name] })}
      className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${config[name] ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${config[name] ? "left-7" : "left-1"}`} />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Configure platform-wide settings and preferences"
      />

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-5 py-3 rounded-xl flex items-center gap-2">
          ✅ Settings saved successfully.
        </div>
      )}

      {/* General */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">General Settings</h2>
        <p className="text-xs text-slate-400 mb-5">Basic platform configuration</p>
        <Field label="Platform Name"  desc="The name displayed across the platform.">
          <Input name="platformName" />
        </Field>
        <Field label="Platform Email" desc="Main contact email for notifications.">
          <Input name="platformEmail" type="email" />
        </Field>
        <Field label="Max Organizations" desc="Maximum number of organizations allowed.">
          <Input name="maxOrgs" type="number" />
        </Field>
        <Field label="Max Students per Org" desc="Student limit per organization.">
          <Input name="maxStudentsPerOrg" type="number" />
        </Field>
        <Field label="Session Timeout" desc="Minutes before idle session expires.">
          <Input name="sessionTimeout" type="number" />
        </Field>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">Security & Access</h2>
        <p className="text-xs text-slate-400 mb-5">Authentication and access control</p>
        <Field label="Maintenance Mode"    desc="Prevent all logins except Super Admin.">
          <Toggle name="maintenanceMode" />
        </Field>
        <Field label="Email Notifications" desc="Send email alerts for key platform events.">
          <Toggle name="emailNotifications" />
        </Field>
        <Field label="Require 2FA"         desc="Force two-factor authentication for all admins.">
          <Toggle name="twoFactorRequired" />
        </Field>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
