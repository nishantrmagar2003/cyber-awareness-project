import { useEffect, useState } from "react";
import StatsCard from "../../components/ui/StatsCard";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

import { getModules } from "../../services/module.service";
import { getTopicProgress } from "../../services/topic.service";
import { getQuizStats } from "../../services/quiz.service";
import { getSimulationStats } from "../../services/simulation.service";
import { getStudentBadges } from "../../services/reward.service";

import "./Dashboard.css";

/* ---------------- MOCK FALLBACK DATA ---------------- */

const MOCK_MODULES = [
  { id: 1, title: "Personal Cyber Protection", progress: 60, color: "#22c55e" },
  { id: 2, title: "Online Threat Awareness", progress: 40, color: "#3b82f6" },
  { id: 3, title: "Device & Network Safety", progress: 30, color: "#6366f1" },
  { id: 4, title: "Digital Payments & Scams", progress: 20, color: "#f59e0b" }
];

const MOCK_STATS = {
  modulesAvailable: 4,
  topicsCompleted: 14,
  quizAvgScore: 65,
  simulationsCompleted: 3,
  badgesEarned: 2
};

const MOCK_BADGES = [
  { id: 1, icon: "🛡️", name: "First Shield", desc: "Completed first module" },
  { id: 2, icon: "🔒", name: "Lock Expert", desc: "Scored 80%+ on Password quiz" },
  { id: 3, icon: "🎯", name: "Phishing Hunter", desc: "Passed phishing simulations" }
];

const MOCK_NEXT_TOPIC = {
  module: "Online Threat Awareness",
  topic: "Fake SMS Detection"
};

const MOCK_WEAK_AREA = "Phishing Awareness";

/* ---------------- CIRCLE PROGRESS ---------------- */

function CircleProgress({ value = 0, color = "#3b82f6", size = 100 }) {
  return (
    <div
      className="sd-circle-wrap"
      style={{
        "--value": `${value}%`,
        "--color": color
      }}
    >
      <div
        className="sd-circle"
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
      >
        <span>{value}%</span>
      </div>
    </div>
  );
}

/* ---------------- MAIN DASHBOARD ---------------- */

export default function StudentDashboard() {

  const [modules, setModules] = useState(MOCK_MODULES);
  const [stats, setStats] = useState(MOCK_STATS);
  const [badges, setBadges] = useState(MOCK_BADGES);
  const [nextTopic, setNextTopic] = useState(MOCK_NEXT_TOPIC);
  const [weakArea, setWeakArea] = useState(MOCK_WEAK_AREA);
  const [loading, setLoading] = useState(true);

  const studentName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.full_name || u.name || u.username || "Student";
    } catch {
      return "Student";
    }
  })();

  const totalTopics = Math.max(modules.length * 8, 1);

  const overallPct = Math.min(
    100,
    Math.round((stats.topicsCompleted / totalTopics) * 100)
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          modulesRes,
          topicsRes,
          quizRes,
          simRes,
          badgeRes
        ] = await Promise.allSettled([
          getModules(),
          getTopicProgress(),
          getQuizStats(),
          getSimulationStats(),
          getStudentBadges()
        ]);

        if (cancelled) return;

        const COLORS = ["#22c55e", "#3b82f6", "#6366f1", "#f59e0b", "#8b5cf6", "#06b6d4"];

        let apiModulesLength = MOCK_STATS.modulesAvailable;

        if (modulesRes.status === "fulfilled") {
          const apiModules = modulesRes.value?.data;

          if (Array.isArray(apiModules) && apiModules.length) {
            apiModulesLength = apiModules.length;

            setModules(
              apiModules.map((m, i) => ({
                id: m.id,
                title: m.title || `Module ${i + 1}`,
                progress: Number(m.progress || 0),
                color: COLORS[i % COLORS.length]
              }))
            );
          }
        }

        const newStats = { ...MOCK_STATS, modulesAvailable: apiModulesLength };

        if (topicsRes.status === "fulfilled") {
          const data = topicsRes.value?.data || {};
          newStats.topicsCompleted = data.completed ?? MOCK_STATS.topicsCompleted;

          if (data.nextTopic) {
            setNextTopic({
              module: data.nextTopic.moduleName || "Module",
              topic: data.nextTopic.title || "Topic"
            });
          }
        }

        if (quizRes.status === "fulfilled") {
          const data = quizRes.value?.data || {};
          newStats.quizAvgScore = data.averageScore ?? MOCK_STATS.quizAvgScore;

          if (data.weakArea) {
            setWeakArea(data.weakArea);
          }
        }

        if (simRes.status === "fulfilled") {
          const data = simRes.value?.data || {};
          newStats.simulationsCompleted =
            data.completed ?? MOCK_STATS.simulationsCompleted;
        }

        if (badgeRes.status === "fulfilled") {
          const data = badgeRes.value?.data;
          if (Array.isArray(data)) {
            setBadges(data.slice(0, 3));
            newStats.badgesEarned = data.length;
          }
        }

        setStats(newStats);
      } catch (err) {
        console.error("Dashboard API error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sd-root">

      <PageHeader
        title="Your Cybersecurity Progress"
        subtitle={`Welcome back, ${studentName}. Stay safe. Stay informed.`}
      />

      <section className="sd-hero">
        <div className="sd-hero-grid">

          <div className="sd-hero-left">

            <p className="sd-hero-label">Overall Progress</p>

            <div className="sd-hero-score">
              {loading ? "—" : `${overallPct}%`}
            </div>

            <div className="sd-status-wrap">
              <StatusBadge
                status={
                  overallPct >= 80
                    ? "Completed"
                    : overallPct >= 40
                    ? "In Progress"
                    : "Not Started"
                }
              />
            </div>

            <p className="sd-hero-desc">
              Track your cybersecurity learning journey across modules,
              quizzes, simulations, and rewards.
            </p>

            <div className="sd-overall-track">
              <div
                className="sd-overall-fill"
                style={{ width: `${overallPct}%` }}
              />
            </div>

          </div>

          <div className="sd-hero-right">

            <div className="sd-chapters-box">

              <strong className="sd-chapters-title">
                Completed Chapters
              </strong>

              <p className="sd-chapters-value">
                {stats.topicsCompleted} <span>/ {totalTopics}</span>
              </p>

              <div className="sd-chapters-track">
                <div
                  className="sd-chapters-fill"
                  style={{ width: `${overallPct}%` }}
                />
              </div>

              <div className="sd-notice">
                ⚠ Weak Area: {weakArea}
                <br />
                ✅ Next: {nextTopic.topic}
              </div>

            </div>

          </div>

        </div>
      </section>

      <section className="sd-stats-section">
        <div className="sd-stats-grid">
          <StatsCard title="Modules" value={stats.modulesAvailable} icon="📦" color="blue" />
          <StatsCard title="Topics Completed" value={stats.topicsCompleted} icon="✅" color="green" />
          <StatsCard title="Quiz Average" value={`${stats.quizAvgScore}%`} icon="📝" color="amber" />
          <StatsCard title="Simulations" value={stats.simulationsCompleted} icon="🎯" color="indigo" />
          <StatsCard title="Badges" value={stats.badgesEarned} icon="🏅" color="blue" />
        </div>
      </section>

      <section className="sd-card sd-modules-card">

        <h3 className="sd-section-heading">Learning Modules</h3>

        <div className="sd-module-circles">

          {modules.map((m, index) => (
            <div key={m.id || index} className="sd-module-item">

              <CircleProgress value={m.progress} color={m.color} />

              <h4 className="sd-module-title">
                Module {index + 1}
              </h4>

              <small className="sd-module-subtitle">
                {m.title}
              </small>

            </div>
          ))}

        </div>

      </section>

      <section className="sd-card sd-badges-card">

        <div className="sd-card-head">
          <h3 className="sd-section-heading">Recent Badges</h3>
        </div>

        <div className="sd-badges">

          {badges.map((b) => (
            <div key={b.id} className="sd-badge">

              <span className="sd-badge-icon">{b.icon}</span>

              <div className="sd-badge-content">
                <strong>{b.name}</strong>
                <p>{b.desc}</p>
              </div>

            </div>
          ))}

        </div>

      </section>

      <footer className="sd-footer">
        Built for national cyber awareness
      </footer>

    </div>
  );
}