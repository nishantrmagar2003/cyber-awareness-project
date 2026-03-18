import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/users.css";
import Modal from "../../components/ui/Modal";

const MOCK = [
  { id: 1, name: "Arun Sharma",   email: "arun@tech.np",    role: "Student",   org: "TechCorp Nepal", status: "Active"   },
  { id: 2, name: "Priya Thapa",   email: "priya@fin.np",    role: "Org Admin", org: "FinServe Ltd",   status: "Active"   },
  { id: 3, name: "Bikash KC",     email: "bikash@health.np",role: "Student",   org: "HealthPlus",     status: "Inactive" },
  { id: 4, name: "Sita Rai",      email: "sita@edu.np",     role: "Student",   org: "EduNepal",       status: "Active"   },
  { id: 5, name: "Rajan Poudel",  email: "rajan@gov.np",    role: "Org Admin", org: "GovSec Agency",  status: "Pending"  },
  { id: 6, name: "Mina Gurung",   email: "mina@retail.np",  role: "Student",   org: "RetailChain Co", status: "Active"   },
  { id: 7, name: "Deepak Bhatt",  email: "deepak@manu.np",  role: "Student",   org: "ManuFact Nepal", status: "Inactive" },
];

const ROLE_COLORS = {
  "Student":   "bg-sky-50 text-sky-700",
  "Org Admin": "bg-purple-50 text-purple-700",
  "Super Admin":"bg-amber-50 text-amber-700",
};

export default function Users() {
  const [users, setUsers]   = useState(MOCK);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    // axios.get("/api/users").then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns = [
    {
      key: "name", label: "Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.name.split(" ").map(n => n[0]).join("").slice(0,2)}
          </div>
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "email",  label: "Email" },
    {
      key: "role", label: "Role",
      render: (r) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[r.role] || "bg-slate-100 text-slate-600"}`}>
          {r.role}
        </span>
      ),
    },
    { key: "org",    label: "Organization" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions", label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button className="text-xs text-blue-600 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            Edit
          </button>
          <button
            onClick={() => setUsers(prev => prev.filter(u => u.id !== r.id))}
            className="text-xs text-rose-600 font-medium border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Users Management"
        subtitle="View and manage all users across organizations"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 text-slate-600"
          >
            <option>All</option>
            <option>Student</option>
            <option>Org Admin</option>
          </select>
        </div>

        {/* Summary row */}
        <div className="flex gap-4 mb-5 text-sm">
          <span className="text-slate-500">Total: <strong className="text-slate-800">{filtered.length}</strong></span>
          <span className="text-green-600">Active: <strong>{filtered.filter(u => u.status === "Active").length}</strong></span>
          <span className="text-slate-400">Inactive: <strong>{filtered.filter(u => u.status !== "Active").length}</strong></span>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No users found." />
      </div>
    </div>
  );
}
