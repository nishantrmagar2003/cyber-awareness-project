export default function StatusBadge({ status }) {
  const normalized = String(status || "").trim().toLowerCase();

  const styles = {
    active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    inactive: "bg-slate-100 text-slate-600 border border-slate-200",
    suspended: "bg-rose-50 text-rose-700 border border-rose-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    completed: "bg-blue-50 text-blue-700 border border-blue-200",
    "in progress": "bg-indigo-50 text-indigo-700 border border-indigo-200",
    in_progress: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    "not started": "bg-slate-100 text-slate-600 border border-slate-200",
    not_started: "bg-slate-100 text-slate-600 border border-slate-200",
    failed: "bg-rose-50 text-rose-700 border border-rose-200",
    passed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  const labels = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    pending: "Pending",
    completed: "Completed",
    "in progress": "In Progress",
    in_progress: "In Progress",
    "not started": "Not Started",
    not_started: "Not Started",
    failed: "Failed",
    passed: "Passed",
  };

  const cls =
    styles[normalized] ||
    "bg-slate-100 text-slate-600 border border-slate-200";

  const label = labels[normalized] || status || "Unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}