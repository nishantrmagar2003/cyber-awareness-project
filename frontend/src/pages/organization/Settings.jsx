import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import "../../styles/org-settings.css";

export default function OrgSettings() {
  const [saved, setSaved] = useState(false);
  const [org, setOrg]     = useState({ name: "TechCorp Nepal", industry: "Technology", email: "contact@techcorp.np" });
  const [profile, setProfile] = useState({ name: "Priya Thapa", email: "priya@techcorp.np", phone: "+977-9812345678" });
  const [pass, setPass]   = useState({ current: "", newPass: "", confirm: "" });
  const [passError, setPassError] = useState("");

  const save = (label) => {
    setSaved(label);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePassChange = () => {
    if (!pass.current)                     { setPassError("Enter your current password."); return; }
    if (pass.newPass.length < 6)           { setPassError("New password must be 6+ characters."); return; }
    if (pass.newPass !== pass.confirm)     { setPassError("Passwords do not match."); return; }
    setPassError("");
    setPass({ current: "", newPass: "", confirm: "" });
    save("Password");
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );

  const Input = ({ value, onChange, type = "text", placeholder }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
    />
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Settings" subtitle="Manage your organization and account settings" />

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-5 py-3 rounded-xl flex items-center gap-2">
          ✅ {saved} settings saved successfully.
        </div>
      )}

      {/* Organization Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">Organization Information</h2>
        <p className="text-xs text-slate-400 mb-6">Update your organization's profile details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Organization Name">
            <Input value={org.name} onChange={(e) => setOrg({...org, name: e.target.value})} placeholder="Organization name" />
          </Field>
          <Field label="Industry">
            <select
              value={org.industry}
              onChange={(e) => setOrg({...org, industry: e.target.value})}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
            >
              {["Technology","Finance","Healthcare","Education","Government","Retail","Manufacturing"].map(i => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </Field>
          <Field label="Contact Email">
            <Input type="email" value={org.email} onChange={(e) => setOrg({...org, email: e.target.value})} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => save("Organization")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Save Organization
          </button>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">Admin Profile</h2>
        <p className="text-xs text-slate-400 mb-6">Update your personal profile information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name">
            <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
          </Field>
          <Field label="Email Address">
            <Input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
          </Field>
          <Field label="Phone Number">
            <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => save("Profile")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">Change Password</h2>
        <p className="text-xs text-slate-400 mb-6">Keep your account secure with a strong password</p>
        {passError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl mb-5">
            {passError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
          <Field label="Current Password">
            <Input type="password" value={pass.current} onChange={(e) => setPass({...pass, current: e.target.value})} placeholder="••••••••" />
          </Field>
          <div /> {/* spacer */}
          <Field label="New Password">
            <Input type="password" value={pass.newPass} onChange={(e) => setPass({...pass, newPass: e.target.value})} placeholder="Min. 6 characters" />
          </Field>
          <Field label="Confirm New Password">
            <Input type="password" value={pass.confirm} onChange={(e) => setPass({...pass, confirm: e.target.value})} placeholder="Repeat new password" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handlePassChange}
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
