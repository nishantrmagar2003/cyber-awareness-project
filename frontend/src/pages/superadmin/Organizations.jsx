import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/organizations.css";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";

const MOCK = [
  { id: 1, name: "TechCorp Nepal",   industry: "Technology", status: "Active",    created: "2024-01-10" },
  { id: 2, name: "FinServe Ltd",     industry: "Finance",    status: "Active",    created: "2024-02-14" },
  { id: 3, name: "HealthPlus",       industry: "Healthcare", status: "Inactive",  created: "2024-03-05" },
  { id: 4, name: "EduNepal",         industry: "Education",  status: "Active",    created: "2024-03-22" },
  { id: 5, name: "GovSec Agency",    industry: "Government", status: "Suspended", created: "2024-04-01" },
  { id: 6, name: "RetailChain Co",   industry: "Retail",     status: "Active",    created: "2024-04-18" },
  { id: 7, name: "ManuFact Nepal",   industry: "Manufacturing", status: "Pending", created: "2024-05-02"},
];

const EMPTY_FORM = { name: "", industry: "", status: "Active", adminEmail: "", adminName: "" };

export default function Organizations() {
  const [orgs, setOrgs]           = useState(MOCK);
  const [search, setSearch]       = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [adminOpen, setAdminOpen]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    // axios.get("/api/organizations").then(r => setOrgs(r.data)).catch(() => {});
  }, []);

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.industry.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const newOrg = { id: Date.now(), name: form.name, industry: form.industry, status: form.status, created: new Date().toISOString().split("T")[0] };
    setOrgs((prev) => [newOrg, ...prev]);
    // axios.post("/api/organizations", form).then(r => setOrgs(prev => [r.data, ...prev])).catch(() => {});
    setCreateOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this organization?")) return;
    setOrgs((prev) => prev.filter((o) => o.id !== id));
    // axios.delete(`/api/organizations/${id}`).catch(() => {});
  };

  const columns = [
    { key: "name",     label: "Organization Name" },
    { key: "industry", label: "Industry" },
    { key: "status",   label: "Status",  render: (r) => <StatusBadge status={r.status} /> },
    { key: "created",  label: "Created Date" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            View
          </button>
          <button
            onClick={() => { setSelectedOrg(r); setAdminOpen(true); }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            + Admin
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
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
        title="Organizations"
        subtitle="Manage all organizations on the platform"
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
          >
            <span>+</span> Create Organization
          </button>
        }
      />

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 text-slate-600">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No organizations found." />
      </div>

      {/* Create Organization Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Organization">
        <div className="space-y-4">
          {[
            { label: "Organization Name", key: "name",     type: "text",   ph: "e.g. TechCorp Nepal" },
            { label: "Industry",          key: "industry", type: "text",   ph: "e.g. Technology" },
          ].map(({ label, key, type, ph }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-all"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Create Organization
            </button>
            <button
              onClick={() => setCreateOpen(false)}
              className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Admin Modal */}
      <Modal isOpen={adminOpen} onClose={() => setAdminOpen(false)} title={`Create Admin — ${selectedOrg?.name || ""}`}>
        <div className="space-y-4">
          {[
            { label: "Admin Full Name", key: "adminName",  ph: "e.g. Priya Thapa" },
            { label: "Admin Email",     key: "adminEmail", ph: "e.g. admin@org.np" },
          ].map(({ label, key, ph }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                type="text"
                placeholder={ph}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setAdminOpen(false)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Create Admin
            </button>
            <button
              onClick={() => setAdminOpen(false)}
              className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
