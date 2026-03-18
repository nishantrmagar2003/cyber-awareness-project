import { useEffect, useState } from "react";
import StatsCard from "../../components/ui/StatsCard";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/org-dashboard.css";

const MOCK_STATS = {
  totalStudents: 142,
  activeStudents: 118,
  completedModules: 864,
  avgQuizScore: 76,
};

const MOCK_STUDENTS = [
  { name: "Arun Sharma",   email: "arun@tech.np",  progress: 85, status: "Active"   },
  { name: "Priya Lama",    email: "priya@tech.np", progress: 62, status: "Active"   },
  { name: "Bikash KC",     email: "bikash@tech.np",progress: 0,  status: "Inactive" },
  { name: "Sita Rai",      email: "sita@tech.np",  progress: 91, status: "Active"   },
  { name: "Rajan Poudel",  email: "rajan@tech.np", progress: 45, status: "Active"   },
];

const MOCK_MODULES = [
  { module: "Phishing Awareness",      completionRate: 78, students: 110 },
  { module: "Password Security",       completionRate: 85, students: 120 },
  { module: "Social Engineering",      completionRate: 55, students:  78 },
  { module: "Network Security Basics", completionRate: 40, students:  56 },
];

function ProgressBar({ value, color = "blue" }) {
  const colors = { blue: "bg-blue-500", green: "bg-green-500", amber: "bg-amber-500" };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color] || colors.blue} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function OrgAdminDashboard() {
  const [stats,   setStats]   = useState(MOCK_STATS);
  const [students, setStudents] = useState(MOCK_STUDENTS);

  useEffect(() => {
    // axios.get("/api/org/dashboard").then(r => setStats(r.data)).catch(() => {});
    // axios.get("/api/org/students?limit=5").then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const studentColumns = [
    {
      key: "name", label: "Student",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.name.split(" ").map(n => n[0]).join("").slice(0,2)}
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
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Organization Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">TechCorp Nepal — training overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard title="Total Students"     value={stats.totalStudents}                    icon="🎓" color="indigo" change={6}  />
        <StatsCard title="Active Students"    value={stats.activeStudents}                   icon="✅" color="green"  change={3}  />
        <StatsCard title="Completed Modules"  value={stats.completedModules.toLocaleString()} icon="📦" color="blue"   change={18} />
        <StatsCard title="Avg Quiz Score"     value={`${stats.avgQuizScore}%`}               icon="🧠" color="amber"  change={-2} />
      </div>

      {/* Module Completion Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-800">Module Completion Rates</h2>
          <p className="text-xs text-slate-400 mt-0.5">How students are progressing through each module</p>
        </div>
        <div className="space-y-5">
          {MOCK_MODULES.map((m) => (
            <div key={m.module}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{m.module}</span>
                <span className="text-xs text-slate-400">{m.students} students enrolled</span>
              </div>
              <ProgressBar
                value={m.completionRate}
                color={m.completionRate >= 80 ? "green" : m.completionRate >= 50 ? "blue" : "amber"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Students */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Recent Students</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest student activity in your organization</p>
          </div>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            View all →
          </button>
        </div>
        <DataTable columns={studentColumns} data={students} />
      </div>
    </div>
  );
}
