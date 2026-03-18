export default function StatusBadge({ status }) {
  const styles = {
    Active:    "bg-green-100 text-green-700",
    Inactive:  "bg-slate-100 text-slate-500",
    Suspended: "bg-rose-100 text-rose-600",
    Pending:   "bg-amber-100 text-amber-600",
    Completed: "bg-blue-100 text-blue-700",
  };
  const cls = styles[status] || "bg-slate-100 text-slate-500";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
