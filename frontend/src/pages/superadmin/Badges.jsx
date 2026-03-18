import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import "../../styles/badges.css";

const MOCK_BADGES = [
  { id:1, name:"Phishing Shield",    icon:"🛡️", description:"Completed Phishing module with 90%+ score", awarded: 234, color:"blue"   },
  { id:2, name:"Password Champion",  icon:"🔑", description:"Set strong passwords and passed quiz",       awarded: 189, color:"green"  },
  { id:3, name:"Security Rookie",    icon:"⭐", description:"Completed first cybersecurity module",       awarded: 512, color:"amber"  },
  { id:4, name:"Cyber Guardian",     icon:"🏆", description:"Completed all modules with 80%+ average",   awarded:  67, color:"indigo" },
  { id:5, name:"Simulation Pro",     icon:"🎯", description:"Passed 5 simulations without clicking",     awarded:  98, color:"rose"   },
];

const COLOR_MAP = {
  blue:   "from-blue-100 to-blue-50   border-blue-200",
  green:  "from-green-100 to-green-50  border-green-200",
  amber:  "from-amber-100 to-amber-50  border-amber-200",
  indigo: "from-indigo-100 to-indigo-50 border-indigo-200",
  rose:   "from-rose-100 to-rose-50   border-rose-200",
};

const EMPTY = { name: "", icon: "🏅", description: "", color: "blue" };

export default function Badges() {
  const [badges, setBadges] = useState(MOCK_BADGES);
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState(EMPTY);

  useEffect(() => {
    // axios.get("/api/badges").then(r => setBadges(r.data)).catch(() => {});
  }, []);

  const handleCreate = () => {
    setBadges((prev) => [{ id: Date.now(), ...form, awarded: 0 }, ...prev]);
    // axios.post("/api/badges", form).catch(() => {});
    setOpen(false);
    setForm(EMPTY);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Badges Management"
        subtitle="Create and manage achievement badges for students"
        action={
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
          >
            <span>+</span> Create Badge
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`bg-gradient-to-br ${COLOR_MAP[badge.color] || COLOR_MAP.blue} border rounded-2xl p-6 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{badge.icon}</div>
              <div className="flex gap-2">
                <button className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 bg-white px-2.5 py-1 rounded-lg transition-colors">
                  Edit
                </button>
                <button
                  onClick={() => setBadges((prev) => prev.filter((b) => b.id !== badge.id))}
                  className="text-xs text-rose-500 hover:text-rose-700 border border-rose-100 bg-white px-2.5 py-1 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">{badge.name}</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{badge.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>🎓</span>
              <span>{badge.awarded.toLocaleString()} students awarded</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Badge">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Badge Name</label>
            <input
              type="text"
              placeholder="e.g. Phishing Shield"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon (emoji)</label>
            <input
              type="text"
              placeholder="e.g. 🛡️"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Describe how to earn this badge"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Color Theme</label>
            <select
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-all"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="amber">Amber</option>
              <option value="indigo">Indigo</option>
              <option value="rose">Rose</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Create Badge
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
