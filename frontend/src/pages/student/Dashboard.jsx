import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../../components/ui/StatsCard";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

import { getModules } from "../../services/module.service";
import { getQuizStats } from "../../services/quiz.service";
import { getSimulationStats } from "../../services/simulation.service";
import { getStudentBadges } from "../../services/reward.service";
import { getProgress, getTopicProgress } from "../../services/progress.service";
import { getStudentCertificates } from "../../services/certificate.service";

import "./Dashboard.css";

/* ---------------- CIRCLE PROGRESS ---------------- */

function CircleProgress({ value = 0, color = "#3b82f6", size = 100 }) {
  return (
    <div
      className="sd-circle-wrap"
      style={{
        "--value": `${value}%`,
        "--color": color,
      }}
    >
      <div
        className="sd-circle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <span>{value}%</span>
      </div>
    </div>
  );
}

/* ---------------- MAIN DASHBOARD ---------------- */

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    modulesAvailable: 0,
    generalModules: 0,
    premiumModules: 0,
    premiumModulesCompleted: 0,
    premiumCertificates: 0,
    quizAvgScore: 0,
    simulationsCompleted: 0,
    badgesEarned: 0,
  });

  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const studentName =
    user.full_name || user.name || user.username || "Student";

  const isOrgStudent = user.role === "org_student";

  const overallPct =
    Number(progress.total || 0) === 0
      ? 0
      : Math.round(
          (Number(progress.completed || 0) / Number(progress.total || 0)) * 100
        );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);

        const [modulesRes, quizRes, simRes, badgeRes, progressRes, certRes] =
          await Promise.allSettled([
            getModules(),
            getQuizStats(),
            getSimulationStats(),
            getStudentBadges(),
            getProgress(),
            getStudentCertificates(),
          ]);

        if (cancelled) return;

        const COLORS = ["#22c55e", "#3b82f6", "#6366f1", "#8b5cf6", "#f59e0b"];

        let apiModules = [];
        if (modulesRes.status === "fulfilled") {
          apiModules = Array.isArray(modulesRes.value) ? modulesRes.value : [];
        }

        if (progressRes.status === "fulfilled") {
          const data = progressRes.value || {};
          setProgress({
            total: Number(data.total || 0),
            completed: Number(data.completed || 0),
          });
        } else {
          setProgress({
            total: 0,
            completed: 0,
          });
        }

        let certificateList = [];
        if (certRes.status === "fulfilled") {
          certificateList = Array.isArray(certRes.value) ? certRes.value : [];
        }
        setCertificates(certificateList);

        const moduleProgressResults = await Promise.all(
          apiModules.map(async (moduleItem, index) => {
            const moduleTopics = Array.isArray(moduleItem.topics)
              ? moduleItem.topics
              : [];

            const isPremium =
              Number(moduleItem.is_public || 0) === 0 &&
              moduleItem.audience_type === "organization";

            if (moduleTopics.length === 0) {
              return {
                id: moduleItem.id,
                title: moduleItem.title || `Module ${index + 1}`,
                description: moduleItem.description || "",
                is_public: Number(moduleItem.is_public || 0),
                audience_type: moduleItem.audience_type || "general",
                isPremium,
                color: COLORS[index % COLORS.length],
                progress: 0,
              };
            }

            const topicProgressList = await Promise.all(
              moduleTopics.map(async (topic) => {
                try {
                  return await getTopicProgress(topic.id);
                } catch {
                  return null;
                }
              })
            );

            const completedTopics = topicProgressList.filter(
              (tp) => Number(tp?.completed || 0) === 1
            ).length;

            const modulePct = Math.round(
              (completedTopics / moduleTopics.length) * 100
            );

            return {
              id: moduleItem.id,
              title: moduleItem.title || `Module ${index + 1}`,
              description: moduleItem.description || "",
              is_public: Number(moduleItem.is_public || 0),
              audience_type: moduleItem.audience_type || "general",
              isPremium,
              color: COLORS[index % COLORS.length],
              progress: Number.isFinite(modulePct) ? modulePct : 0,
            };
          })
        );

        if (!cancelled) {
          setModules(moduleProgressResults);
        }

        const generalCount = moduleProgressResults.filter((m) => !m.isPremium).length;
        const premiumCount = moduleProgressResults.filter((m) => m.isPremium).length;

        const premiumCompletedCount = moduleProgressResults.filter(
          (m) => m.isPremium && Number(m.progress || 0) >= 100
        ).length;

        const premiumCertificateCount = certificateList.filter(
          (c) => c.certificate_type === "module"
        ).length;

        const newStats = {
          modulesAvailable: moduleProgressResults.length,
          generalModules: generalCount,
          premiumModules: premiumCount,
          premiumModulesCompleted: premiumCompletedCount,
          premiumCertificates: premiumCertificateCount,
          quizAvgScore: 0,
          simulationsCompleted: 0,
          badgesEarned: 0,
        };

        if (quizRes.status === "fulfilled") {
          const data = quizRes.value || {};
          newStats.quizAvgScore = Number(data.averageScore || 0);
        }

        if (simRes.status === "fulfilled") {
          const data = simRes.value || {};
          newStats.simulationsCompleted = Number(data.completed || 0);
        }

        if (badgeRes.status === "fulfilled") {
          const data = Array.isArray(badgeRes.value) ? badgeRes.value : [];
          setBadges(data.slice(0, 3));
          newStats.badgesEarned = data.length;
        } else {
          setBadges([]);
        }

        if (!cancelled) {
          setStats(newStats);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const progressStatus =
    progress.completed === 0
      ? "Not Started"
      : overallPct >= 100
      ? "Completed"
      : "In Progress";

  const generalModules = modules.filter((m) => !m.isPremium);
  const premiumModules = modules.filter((m) => m.isPremium);

  function renderModuleSection(title, subtitle, list) {
    if (list.length === 0) return null;

    return (
      <section className="sd-card sd-modules-card">
        <div className="sd-section-head">
          <h3 className="sd-section-heading">{title}</h3>
          <p className="sd-section-subtitle">{subtitle}</p>
        </div>

        <div className="sd-module-circles">
          {list.map((m) => {
            const moduleId = m.id;
            const displayIndex = modules.findIndex((x) => x.id === m.id) + 1;

            const hasCertificate =
              m.isPremium &&
              certificates.some(
                (c) =>
                  c.certificate_type === "module" &&
                  Number(c.reference_id) === Number(moduleId)
              );

            return (
              <div key={moduleId} className="sd-module-item">
                <CircleProgress value={m.progress || 0} color={m.color} />

                <h4 className="sd-module-title">Module {displayIndex}</h4>

                <small className="sd-module-subtitle">{m.title}</small>

                {m.isPremium && (
                  <div className="sd-module-cert-wrap">
                    <span
                      className={`sd-module-cert ${
                        hasCertificate
                          ? "sd-module-cert--earned"
                          : "sd-module-cert--pending"
                      }`}
                    >
                      {hasCertificate
                        ? "Certificate Earned"
                        : "Certificate Pending"}
                    </span>
                  </div>
                )}

                <div className="sd-module-btn-wrap">
                  <button
                    onClick={() => navigate(`/student/module/${moduleId}`)}
                    className="sd-module-btn"
                  >
                    Open Module
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

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
              <StatusBadge status={progressStatus} />
            </div>
          </div>

          <div className="sd-hero-right">
            <div className="sd-chapters-box">
              <strong>Completed Chapters</strong>
              <p>
                {progress.completed} / {progress.total}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sd-stats-section">
        <div className="sd-stats-grid">
          <StatsCard
            title="Accessible Modules"
            value={stats.modulesAvailable}
            icon="📦"
            color="blue"
          />

          <StatsCard
            title="Quiz Average"
            value={`${stats.quizAvgScore}%`}
            icon="📝"
            color="amber"
          />

          <StatsCard
            title="Simulations"
            value={stats.simulationsCompleted}
            icon="🎯"
            color="indigo"
          />

          <StatsCard
            title="Badges"
            value={stats.badgesEarned}
            icon="🏅"
            color="blue"
          />
        </div>
      </section>

      {isOrgStudent && (
        <section className="sd-stats-section sd-stats-section--secondary">
          <div className="sd-stats-grid">
            <StatsCard
              title="Premium Modules"
              value={stats.premiumModules}
              icon="🏢"
              color="blue"
            />

            <StatsCard
              title="Completed Premium"
              value={stats.premiumModulesCompleted}
              icon="✅"
              color="amber"
            />

            <StatsCard
              title="Premium Certificates"
              value={stats.premiumCertificates}
              icon="📜"
              color="indigo"
            />
          </div>
        </section>
      )}

      {renderModuleSection(
        "General Learning Modules",
        "Available to all students.",
        generalModules
      )}

      {isOrgStudent &&
        renderModuleSection(
          "Premium Organization Modules",
          "Assigned premium training modules for your organization.",
          premiumModules
        )}

      <footer className="sd-footer">Built for national cyber awareness</footer>
    </div>
  );
}