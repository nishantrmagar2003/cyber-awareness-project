import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import "../../styles/students.css";

const MOCK = [
  { id:1, name:"Arun Sharma",   email:"arun@tech.np",  status:"Active",   progress:85, joined:"2024-01-10" },
  { id:2, name:"Priya Lama",    email:"priya@tech.np", status:"Active",   progress:62, joined:"2024-01-15" },
  { id:3, name:"Bikash KC",     email:"bikash@tech.np",status:"Inactive", progress:0,  joined:"2024-02-01" },
  { id:4, name:"Sita Rai",      email:"sita@tech.np",  status:"Active",   progress:91, joined:"2024-02-10" },
  { id:5, name:"Rajan Poudel",  email:"rajan@tech.np", status:"Active",   progress:45, joined:"2024-02-18" },
  { id:6, name:"Mina Gurung",   email:"mina@tech.np",  status:"Active",   progress:73, joined:"2024-03-02" },
  { id:7, name:"Deepak Bhatt",  email:"deepak@tech.np",status:"Pending",  progress:10, joined:"2024-03-20" },
];

const EMPTY = { name: "", email: "" };

function ProgressBar({ value }) {
  const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-blue-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600">{value}%</span>
    </div>
  );
}

export default function Students({ onViewDetail }) {
  const [students, setStudents] = useState(MOCK);
  const [search, setSearch]     = useState("");
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState(EMPTY);

  useEffect(() => {
    // axios.get("/api/org/students").then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const s = { id: Date.now(), ...form, status: "Pending", progress: 0, joined: new Date().toISOString().split("T")[0] };
    setStudents((prev) => [s, ...prev]);
    // axios.post("/api/org/students", form).catch(() => {});
    setOpen(false);
    setForm(EMPTY);
  };

  const columns = [
    {
      key: "name", label: "Student",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div>
            <p className="font-medium text-slate-800">{r.name}</p>
            <p className="text-xs text-slate-400">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "status",   label: "Status",   render: (r) => <StatusBadge status={r.status} /> },
    { key: "progress", label: "Progress", render: (r) => <ProgressBar value={r.progress} /> },
    { key: "joined",   label: "Joined" },
    {
      key: "actions", label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetail && onViewDetail(r)}
            className="text-xs text-indigo-600 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => setStudents(prev => prev.filter(s => s.id !== r.id))}
            className="text-xs text-rose-600 font-medium border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Students"
        subtitle="Manage students enrolled in your organization"
        action={
          <button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2"
          >
            <span>+</span> Add Student
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 text-slate-600">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="flex gap-4 mb-5 text-sm">
          <span className="text-slate-500">Total: <strong className="text-slate-800">{filtered.length}</strong></span>
          <span className="text-green-600">Active: <strong>{filtered.filter(s=>s.status==="Active").length}</strong></span>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No students found." />
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Student">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Arun Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="e.g. arun@org.np"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <p className="text-xs text-slate-400">An invitation email will be sent to the student.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Add Student
            </button>
            <button
              onClick={() => setOpen(false)}
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
