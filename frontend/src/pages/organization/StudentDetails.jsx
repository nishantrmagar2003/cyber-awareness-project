import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/organization-details.css";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ProgressBar({ value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  const colorClass =
    safeValue >= 80
      ? "orgd-progress__fill--green"
      : safeValue >= 50
        ? "orgd-progress__fill--indigo"
        : "orgd-progress__fill--amber";

  return (
    <div className="orgd-progress">
      <div className="orgd-progress__track">
        <div
          className={`orgd-progress__fill ${colorClass}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <span className="orgd-progress__value">{safeValue}%</span>
    </div>
  );
}

function ScoreBar({ value = 0, color = "slate" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="orgd-progress">
      <div className="orgd-progress__track">
        <div
          className={`orgd-progress__fill orgd-progress__fill--${color}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <span className="orgd-progress__value">{safeValue}%</span>
    </div>
  );
}

function buildModuleProgress(topicRows = [], type = "general") {
  const filteredRows = topicRows.filter((row) => {
    const isPublic = Number(row.module_is_public || 0) === 1;
    const audienceType = row.module_audience_type || "general";

    if (type === "general") {
      return isPublic && audienceType === "general";
    }

    return !isPublic || audienceType === "organization";
  });

  const map = new Map();

  for (const row of filteredRows) {
    const moduleId = row.module_id;

    if (!map.has(moduleId)) {
      map.set(moduleId, {
        module_id: moduleId,
        title: row.module_title || `Module ${moduleId}`,
        totalTopics: 0,
        completedTopics: 0,
        scoreTotal: 0,
        scoreCount: 0,
        latestDate: row.updated_at || null,
      });
    }

    const item = map.get(moduleId);

    item.totalTopics += 1;

    if (row.status === "completed") {
      item.completedTopics += 1;
    }

    const quizScore = Number(row.best_quiz_score || 0);
    const simScore = Number(row.best_simulation_score || 0);

    if (quizScore > 0) {
      item.scoreTotal += quizScore;
      item.scoreCount += 1;
    }

    if (simScore > 0) {
      item.scoreTotal += simScore;
      item.scoreCount += 1;
    }

    if (row.updated_at) {
      const currentTime = new Date(item.latestDate || 0).getTime();
      const nextTime = new Date(row.updated_at).getTime();

      if (nextTime > currentTime) {
        item.latestDate = row.updated_at;
      }
    }
  }

  return Array.from(map.values()).map((item) => {
    const progress =
      item.totalTopics > 0
        ? Math.round((item.completedTopics / item.totalTopics) * 100)
        : 0;

    const averageScore =
      item.scoreCount > 0 ? Math.round(item.scoreTotal / item.scoreCount) : null;

    return {
      module_id: item.module_id,
      title: item.title,
      score: averageScore,
      status:
        progress >= 100
          ? "Completed"
          : progress > 0
            ? "In Progress"
            : "Not Started",
      date: formatDate(item.latestDate),
      progress,
      totalTopics: item.totalTopics,
      completedTopics: item.completedTopics,
    };
  });
}

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`orgd-panel ${className}`}>
      <div className="orgd-section-header">
        <div>
          <h2 className="orgd-section-title">{title}</h2>
          {subtitle && <p className="orgd-section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoStatCard({ label, value, tone = "default" }) {
  return (
    <div className={`orgd-mini-stat orgd-mini-stat--${tone}`}>
      <p className="orgd-mini-stat__label">{label}</p>
      <p className="orgd-mini-stat__value">{value}</p>
    </div>
  );
}

export default function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStudentDetails() {
      try {
        setLoading(true);

        const res = await api.get(`/organizations/students/${id}`);
        const data = res?.data?.data || null;

        if (!cancelled) {
          setStudentData(data);
        }
      } catch (error) {
        console.error("Student detail error:", error);

        if (!cancelled) {
          setStudentData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadStudentDetails();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const student = useMemo(() => {
    if (!studentData?.student) return null;

    return {
      id: studentData.student.id,
      name: studentData.student.full_name || "Student",
      email: studentData.student.email || "-",
      status: studentData.student.status || "Unknown",
      joined: studentData.student.created_at,
      progress: Number(studentData?.summary?.overall_progress || 0),
    };
  }, [studentData]);

  const topicRows = useMemo(() => {
    return Array.isArray(studentData?.topic_progress)
      ? studentData.topic_progress
      : [];
  }, [studentData]);

  const generalModuleProgress = useMemo(() => {
    return buildModuleProgress(topicRows, "general");
  }, [topicRows]);

  const premiumModuleProgress = useMemo(() => {
    return buildModuleProgress(topicRows, "premium");
  }, [topicRows]);

  const beforeAfterResults = useMemo(() => {
    const rows = Array.isArray(studentData?.before_after)
      ? studentData.before_after
      : [];

    return rows.map((row) => ({
      module_id: row.module_id,
      module_title: row.module_title || "Module",
      before_score: Number(row.before_score || 0),
      after_score: Number(row.after_score || 0),
      improvement: Number(row.improvement || 0),
      module_is_public: Number(row.module_is_public || 0),
      module_audience_type: row.module_audience_type || "general",
    }));
  }, [studentData]);

  const weakTopicResults = useMemo(() => {
    const rows = Array.isArray(studentData?.weak_topics)
      ? studentData.weak_topics
      : [];

    return rows.map((row) => ({
      topic_id: row.topic_id,
      topic_title: row.topic_title || "Topic",
      module_title: row.module_title || "Module",
      moduleType:
        Number(row.module_is_public || 0) === 1 &&
        row.module_audience_type === "general"
          ? "General"
          : "Premium",
      status: row.status || "not_started",
      best_quiz_score: Number(row.best_quiz_score || 0),
      best_simulation_score: Number(row.best_simulation_score || 0),
      reason: row.reason || "Needs attention",
    }));
  }, [studentData]);

  const weakAreaSummary = useMemo(() => {
    const summary = studentData?.weak_summary || null;

    if (!summary) return null;

    return {
      overall_progress: Number(summary.overall_progress || 0),
      general_progress: Number(summary.general_progress || 0),
      premium_progress: Number(summary.premium_progress || 0),
      not_attempted_count: Number(summary.not_attempted_count || 0),
      low_quiz_count: Number(summary.low_quiz_count || 0),
      low_simulation_count: Number(summary.low_simulation_count || 0),
      main_area: {
        title: summary?.main_area?.title || "No major weak area",
        description: summary?.main_area?.description || "No summary available",
        topics: Array.isArray(summary?.main_area?.topics)
          ? summary.main_area.topics
          : [],
      },
      all_areas: Array.isArray(summary?.all_areas) ? summary.all_areas : [],
    };
  }, [studentData]);

  const quizResults = useMemo(() => {
    const rows = Array.isArray(studentData?.quiz_attempts)
      ? studentData.quiz_attempts
      : [];

    const map = new Map();

    for (const row of rows) {
      const key = row.quiz_id || row.quiz_title || row.topic_title;
      const currentScore = Number(row.score || 0);

      const item = {
        quiz: row.quiz_title || row.topic_title || "Quiz",
        topic: row.topic_title || "Topic",
        module: row.module_title || "Module",
        moduleType:
          Number(row.module_is_public || 0) === 1 &&
          row.module_audience_type === "general"
            ? "General"
            : "Premium",
        score: currentScore,
        passed:
          Number(row.is_passed || 0) === 1 ||
          Number(row.passed || 0) === 1 ||
          row.passed === true,
        date: formatDate(row.created_at || row.completed_at || row.updated_at),
      };

      if (!map.has(key)) {
        map.set(key, item);
        continue;
      }

      const existing = map.get(key);

      if (currentScore > existing.score) {
        map.set(key, item);
      }
    }

    return Array.from(map.values());
  }, [studentData]);

  const simulationResults = useMemo(() => {
    const rows = Array.isArray(studentData?.simulation_attempts)
      ? studentData.simulation_attempts
      : [];

    const map = new Map();

    for (const row of rows) {
      const key = row.simulation_id || row.simulation_title || row.topic_title;
      const score = Number(row.score || 0);
      const passed =
        Number(row.is_passed || 0) === 1 || row.is_passed === true;

      const item = {
        sim: row.simulation_title || row.topic_title || "Simulation",
        topic: row.topic_title || "Topic",
        module: row.module_title || "Module",
        moduleType:
          Number(row.module_is_public || 0) === 1 &&
          row.module_audience_type === "general"
            ? "General"
            : "Premium",
        result: passed ? "Passed" : "Failed",
        date: formatDate(row.created_at || row.completed_at || row.updated_at),
        score,
      };

      if (!map.has(key)) {
        map.set(key, item);
        continue;
      }

      const existing = map.get(key);

      if (score > existing.score) {
        map.set(key, item);
      }
    }

    return Array.from(map.values());
  }, [studentData]);

  if (loading) {
    return <div className="orgd-loading">Loading student details...</div>;
  }

  if (!student) {
    return (
      <div className="orgd-page">
        <button
          onClick={() => navigate("/organization/students")}
          className="orgd-back-btn"
        >
          ← Back to Students
        </button>

        <section className="orgd-panel">
          <div className="orgd-empty-state">
            <h2 className="orgd-empty-state__title">Student not found</h2>
            <p className="orgd-empty-state__text">
              Could not load this student record.
            </p>
          </div>
        </section>
      </div>
    );
  }

  function renderModuleSection(title, subtitle, modules, emptyText, tone) {
    return (
      <SectionCard title={title} subtitle={subtitle}>
        <div className="orgd-module-list">
          {modules.length === 0 ? (
            <p className="orgd-empty-note">{emptyText}</p>
          ) : (
            modules.map((m, i) => (
              <div key={`${title}-${m.module_id}-${i}`} className="orgd-module-card">
                <div className="orgd-module-card__top">
                  <div className="orgd-module-card__content">
                    <div className="orgd-module-card__title-row">
                      <h3 className="orgd-module-card__title">{m.title}</h3>
                      <span className={`orgd-module-badge orgd-module-badge--${tone}`}>
                        {tone === "general" ? "General" : "Premium"}
                      </span>
                    </div>

                    <p className="orgd-module-card__meta">
                      {m.completedTopics}/{m.totalTopics} topics completed • Last update: {m.date}
                    </p>
                  </div>

                  <div className="orgd-module-card__status">
                    <span className="orgd-module-card__progress-number">
                      {m.progress}%
                    </span>
                    <StatusBadge status={m.status} />
                  </div>
                </div>

                <div className="orgd-module-card__bar">
                  <ProgressBar value={m.progress} />
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="orgd-page">
      <button
        onClick={() => navigate("/organization/students")}
        className="orgd-back-btn"
      >
        ← Back to Students
      </button>

      <section className="orgd-hero">
        <div className="orgd-hero__left">
          <div className="orgd-hero__avatar">{getInitials(student.name)}</div>

          <div className="orgd-hero__content">
            <div className="orgd-hero__row">
              <h1 className="orgd-hero__title">{student.name}</h1>
              <StatusBadge status={student.status} />
            </div>

            <p className="orgd-hero__subtitle">{student.email}</p>
            <p className="orgd-hero__meta">
              Joined: {formatDate(student.joined)}
            </p>
          </div>
        </div>

        <div className="orgd-hero__right">
          <div className="orgd-hero-chip">
            <span className="orgd-hero-chip__label">Overall Progress</span>
            <div className="orgd-hero-chip__bar">
              <ProgressBar value={student.progress} />
            </div>
          </div>
        </div>
      </section>

      <div className="orgd-stats-grid">
        <div className="orgd-stat-card orgd-stat-card--blue">
          <p className="orgd-stat-card__label">General Modules</p>
          <p className="orgd-stat-card__value">{generalModuleProgress.length}</p>
          <p className="orgd-stat-card__note">
            Public/general learning modules tracked for this student.
          </p>
        </div>

        <div className="orgd-stat-card orgd-stat-card--indigo">
          <p className="orgd-stat-card__label">Premium Modules</p>
          <p className="orgd-stat-card__value">{premiumModuleProgress.length}</p>
          <p className="orgd-stat-card__note">
            Organization-only premium learning modules assigned.
          </p>
        </div>

        <div className="orgd-stat-card orgd-stat-card--green">
          <p className="orgd-stat-card__label">Weak Topics</p>
          <p className="orgd-stat-card__value">{weakTopicResults.length}</p>
          <p className="orgd-stat-card__note">
            Topics currently needing more attention and improvement.
          </p>
        </div>
      </div>

      <div className="orgd-two-col">
        {renderModuleSection(
          "General Module Progress",
          "Progress across the general static learning modules.",
          generalModuleProgress,
          "No general/basic module progress found.",
          "general"
        )}

        {renderModuleSection(
          "Premium Module Progress",
          "Progress across organization premium modules.",
          premiumModuleProgress,
          "No premium module progress found.",
          "premium"
        )}
      </div>

      <SectionCard
        title="Weak Area Summary"
        subtitle="Summary of the student's major weak areas and progress gaps."
      >
        {!weakAreaSummary ? (
          <p className="orgd-empty-note">No weak area summary found.</p>
        ) : (
          <div className="orgd-summary-wrap">
            <div className="orgd-summary-main">
              <p className="orgd-summary-main__eyebrow">Main Weak Area</p>
              <h3 className="orgd-summary-main__title">
                {weakAreaSummary.main_area.title}
              </h3>
              <p className="orgd-summary-main__text">
                {weakAreaSummary.main_area.description}
              </p>

              {weakAreaSummary.main_area.topics.length > 0 && (
                <div className="orgd-tag-list">
                  {weakAreaSummary.main_area.topics.map((topic, index) => (
                    <span key={`${topic}-${index}`} className="orgd-tag">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="orgd-summary-stats">
              <InfoStatCard
                label="Overall Progress"
                value={`${weakAreaSummary.overall_progress}%`}
              />
              <InfoStatCard
                label="General Progress"
                value={`${weakAreaSummary.general_progress}%`}
                tone="indigo"
              />
              <InfoStatCard
                label="Premium Progress"
                value={`${weakAreaSummary.premium_progress}%`}
                tone="violet"
              />
              <InfoStatCard
                label="Not Attempted"
                value={weakAreaSummary.not_attempted_count}
              />
              <InfoStatCard
                label="Low Quiz Topics"
                value={weakAreaSummary.low_quiz_count}
                tone="amber"
              />
              <InfoStatCard
                label="Low Simulation Topics"
                value={weakAreaSummary.low_simulation_count}
                tone="rose"
              />
            </div>

            <div className="orgd-table-wrap">
              <div className="orgd-table-scroll">
                <table className="orgd-table">
                  <thead>
                    <tr>
                      <th>Weak Area</th>
                      <th>Count</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weakAreaSummary.all_areas.map((area, index) => (
                      <tr key={`${area.key}-${index}`}>
                        <td>{area.title}</td>
                        <td>{area.value}</td>
                        <td>{area.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Before vs After Performance"
        subtitle="Compare student scores before and after training across modules."
      >
        {beforeAfterResults.length === 0 ? (
          <p className="orgd-empty-note">No before vs after data found.</p>
        ) : (
          <div className="orgd-before-after">
            <div className="orgd-before-after__grid">
              {beforeAfterResults.map((row, index) => {
                const moduleType =
                  row.module_is_public === 1 &&
                  row.module_audience_type === "general"
                    ? "General"
                    : "Premium";

                return (
                  <div
                    key={`before-after-card-${row.module_id}-${index}`}
                    className="orgd-compare-card"
                  >
                    <div className="orgd-compare-card__top">
                      <div>
                        <h3 className="orgd-compare-card__title">
                          {row.module_title}
                        </h3>
                        <p className="orgd-compare-card__subtitle">
                          {moduleType} Module
                        </p>
                      </div>

                      <span
                        className={`orgd-compare-card__change ${
                          row.improvement > 0
                            ? "is-positive"
                            : row.improvement < 0
                              ? "is-negative"
                              : "is-neutral"
                        }`}
                      >
                        {row.improvement > 0 ? "+" : ""}
                        {row.improvement}%
                      </span>
                    </div>

                    <div className="orgd-compare-card__bars">
                      <div>
                        <p className="orgd-compare-card__label">Before</p>
                        <ScoreBar value={row.before_score} color="amber" />
                      </div>

                      <div>
                        <p className="orgd-compare-card__label">After</p>
                        <ScoreBar value={row.after_score} color="green" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="orgd-table-wrap">
              <div className="orgd-table-scroll">
                <table className="orgd-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Type</th>
                      <th>Before</th>
                      <th>After</th>
                      <th>Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beforeAfterResults.map((row, index) => {
                      const moduleType =
                        row.module_is_public === 1 &&
                        row.module_audience_type === "general"
                          ? "General"
                          : "Premium";

                      return (
                        <tr key={`${row.module_id}-${index}`}>
                          <td>{row.module_title}</td>
                          <td>{moduleType}</td>
                          <td>{row.before_score}%</td>
                          <td>{row.after_score}%</td>
                          <td>
                            <span
                              className={`orgd-inline-change ${
                                row.improvement > 0
                                  ? "is-positive"
                                  : row.improvement < 0
                                    ? "is-negative"
                                    : "is-neutral"
                              }`}
                            >
                              {row.improvement > 0 ? "+" : ""}
                              {row.improvement}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Weak Topics Needing Attention"
        subtitle="Topics currently identified as weak areas for this student."
      >
        {weakTopicResults.length === 0 ? (
          <p className="orgd-empty-note">
            No weak topics found for this student.
          </p>
        ) : (
          <div className="orgd-topic-grid">
            {weakTopicResults.map((topic, index) => (
              <div key={`${topic.topic_id}-${index}`} className="orgd-topic-card">
                <div className="orgd-topic-card__top">
                  <div>
                    <p className="orgd-topic-card__title">{topic.topic_title}</p>
                    <p className="orgd-topic-card__meta">
                      {topic.module_title} • {topic.moduleType}
                    </p>
                  </div>

                  <span className="orgd-topic-card__status">
                    {topic.status}
                  </span>
                </div>

                <p className="orgd-topic-card__reason">Reason: {topic.reason}</p>

                <div className="orgd-topic-card__scores">
                  <span className="orgd-topic-pill orgd-topic-pill--blue">
                    Quiz: {topic.best_quiz_score}%
                  </span>
                  <span className="orgd-topic-pill orgd-topic-pill--amber">
                    Simulation: {topic.best_simulation_score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="orgd-two-col">
        <SectionCard
          title="Quiz Results"
          subtitle="Best/most relevant quiz attempt results for this student."
        >
          <div className="orgd-result-list">
            {quizResults.length === 0 ? (
              <p className="orgd-empty-note">No quiz attempts found.</p>
            ) : (
              quizResults.map((q, i) => (
                <div key={i} className="orgd-result-item">
                  <div className="orgd-result-item__main">
                    <p className="orgd-result-item__title">{q.quiz}</p>
                    <p className="orgd-result-item__meta">
                      {q.module} • {q.moduleType} • {q.topic}
                    </p>
                    <p className="orgd-result-item__date">{q.date}</p>
                  </div>

                  <div className="orgd-result-item__side">
                    <span
                      className={`orgd-result-score ${
                        q.score >= 80
                          ? "is-good"
                          : q.score >= 70
                            ? "is-mid"
                            : "is-bad"
                      }`}
                    >
                      {q.score}%
                    </span>

                    <span
                      className={`orgd-result-pill ${
                        q.passed ? "is-pass" : "is-fail"
                      }`}
                    >
                      {q.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Simulation Results"
          subtitle="Simulation attempt performance summary."
        >
          <div className="orgd-table-wrap">
            <div className="orgd-table-scroll">
              <table className="orgd-table">
                <thead>
                  <tr>
                    <th>Simulation</th>
                    <th>Result</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="orgd-table__empty">
                        No simulation attempts found.
                      </td>
                    </tr>
                  ) : (
                    simulationResults.map((s, i) => (
                      <tr key={i}>
                        <td>
                          <div>
                            <p className="orgd-cell-title">{s.sim}</p>
                            <p className="orgd-cell-meta">
                              {s.module} • {s.moduleType} • {s.topic}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`orgd-result-pill ${
                              s.result === "Passed" ? "is-pass" : "is-fail"
                            }`}
                          >
                            {s.result}
                          </span>
                        </td>
                        <td>{s.score}%</td>
                        <td>{s.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
