import { useMemo, useState } from "react";

export default function Settings() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [form, setForm] = useState({
    fullName: user.full_name || user.name || "",
    email: user.email || "",
    language: "English",
    notifications: true,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Settings</h1>
      <div className="bg-white shadow rounded-lg p-6 border space-y-4 max-w-2xl">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Full Name</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Language</span>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.language}
            onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
          >
            <option>English</option>
            <option>Nepali</option>
          </select>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.notifications}
            onChange={(e) => setForm((prev) => ({ ...prev, notifications: e.target.checked }))}
          />
          <span className="text-sm text-slate-700">Enable notifications</span>
        </label>

        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save Changes</button>
      </div>
    </div>
  );
}
