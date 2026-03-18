import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/studentdetails.css";

const MOCK_STUDENT = {
  name:     "Arun Sharma",
  email:    "arun@tech.np",
  status:   "Active",
  joined:   "2024-01-10",
  progress: 85,
};

const MOCK_MODULES = [
  { title:"Phishing Awareness",      score:92, status:"Completed", date:"2024-01-20" },
  { title:"Password Security",       score:84, status:"Completed", date:"2024-02-05" },
  { title:"Social Engineering",      score:78, status:"Completed", date:"2024-03-01" },
  { title:"Network Security Basics", score:null,status:"In Progress", date:"-" },
];

const MOCK_QUIZZES = [
  { quiz:"Phishing Quiz",        score:90, passed:true,  date:"2024-01-21" },
  { quiz:"Password Quiz",        score:80, passed:true,  date:"2024-02-06" },
  { quiz:"Social Eng Quiz",      score:65, passed:false, date:"2024-03-02" },
];

const MOCK_SIMS = [
  { sim:"Phishing Email Simulation",  result:"Passed",     date:"2024-01-25" },
  { sim:"Spear Phishing Attack",      result:"Clicked",    date:"2024-02-15" },
  { sim:"Vishing Call Simulation",    result:"Passed",     date:"2024-03-10" },
];

function ProgressBar({ value }) {
  const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-blue-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-700">{value}%</span>
    </div>
  );
}

export default function StudentDetails({ student = MOCK_STUDENT, onBack }) {
  const s = student || MOCK_STUDENT;

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 font-medium transition-colors"
        >
          ← Back to Students
        </button>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-800">{s.name}</h1>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-sm text-slate-400">{s.email}</p>
            <p className="text-xs text-slate-400 mt-1">Joined: {s.joined}</p>
          </div>
          <div className="w-full sm:w-48">
            <p className="text-xs text-slate-500 mb-2 font-medium">Overall Progress</p>
            <ProgressBar value={s.progress} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modules */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Module Progress</h2>
          <div className="space-y-4">
            {MOCK_MODULES.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{m.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  {m.score !== null && (
                    <span className={`text-xs font-bold ${m.score >= 80 ? "text-green-600" : m.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
                      {m.score}%
                    </span>
                  )}
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Quiz Results</h2>
          <div className="space-y-4">
            {MOCK_QUIZZES.map((q, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{q.quiz}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{q.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${q.score >= 80 ? "text-green-600" : q.score >= 70 ? "text-blue-600" : "text-rose-500"}`}>
                    {q.score}%
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${q.passed ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-600"}`}>
                    {q.passed ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulations */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-5">Simulation Results</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Simulation</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Result</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {MOCK_SIMS.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-700">{s.sim}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.result === "Passed" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-600"
                    }`}>
                      {s.result}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
