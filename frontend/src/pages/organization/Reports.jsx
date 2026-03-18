import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import "../../styles/reports.css";

const TRAINING_DATA = [
  { module:"Phishing Awareness",      enrolled:110, completed:86, avgScore:82 },
  { module:"Password Security",       enrolled:120, completed:102,avgScore:79 },
  { module:"Social Engineering",      enrolled:78,  completed:43, avgScore:71 },
  { module:"Network Security Basics", enrolled:56,  completed:22, avgScore:68 },
  { module:"Advanced Threat Hunting", enrolled:30,  completed:8,  avgScore:85 },
];

const SIM_DATA = [
  { sim:"Phishing Email",   sent:142, passed:109, clicked:33, rate:77 },
  { sim:"Spear Phishing",   sent:142, passed:91,  clicked:51, rate:64 },
  { sim:"Vishing Call",     sent:100, passed:82,  clicked:18, rate:82 },
  { sim:"USB Drop Attack",  sent:60,  passed:55,  clicked:5,  rate:92 },
];

function Bar({ value, max, color = "bg-blue-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-500 w-6">{pct}%</span>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("training");

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Training progress, quiz results, and simulation statistics"
        action={
          <button className="border border-slate-200 text-slate-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
            📥 Export CSV
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["training", "quizzes", "simulations"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "training" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Training Progress Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">Module completion and average scores</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Module","Enrolled","Completed","Completion Rate","Avg Score"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {TRAINING_DATA.map((r, i) => {
                  const rate = Math.round((r.completed / r.enrolled) * 100);
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-700">{r.module}</td>
                      <td className="px-5 py-4 text-slate-500">{r.enrolled}</td>
                      <td className="px-5 py-4 text-slate-500">{r.completed}</td>
                      <td className="px-5 py-4 w-48">
                        <Bar value={r.completed} max={r.enrolled} color={rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-blue-500" : "bg-amber-400"} />
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${r.avgScore >= 80 ? "text-green-600" : r.avgScore >= 70 ? "text-blue-600" : "text-amber-600"}`}>
                          {r.avgScore}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "quizzes" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Quiz Performance Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pass rates and average scores per quiz</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {TRAINING_DATA.map((r, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1 truncate">{r.module}</p>
                <p className={`text-2xl font-bold mb-1 ${r.avgScore >= 80 ? "text-green-600" : r.avgScore >= 70 ? "text-blue-600" : "text-amber-500"}`}>
                  {r.avgScore}%
                </p>
                <p className="text-xs text-slate-400">Average score</p>
                <div className="mt-3">
                  <Bar value={r.avgScore} max={100} color={r.avgScore >= 80 ? "bg-green-500" : r.avgScore >= 70 ? "bg-blue-500" : "bg-amber-400"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "simulations" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Simulation Statistics</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pass vs. clicked rates across simulations</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Simulation","Sent","Passed","Clicked (Failed)","Pass Rate"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {SIM_DATA.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-700">{r.sim}</td>
                    <td className="px-5 py-4 text-slate-500">{r.sent}</td>
                    <td className="px-5 py-4 text-green-600 font-semibold">{r.passed}</td>
                    <td className="px-5 py-4 text-rose-500 font-semibold">{r.clicked}</td>
                    <td className="px-5 py-4 w-48">
                      <Bar value={r.passed} max={r.sent} color={r.rate >= 80 ? "bg-green-500" : r.rate >= 60 ? "bg-blue-500" : "bg-rose-400"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
