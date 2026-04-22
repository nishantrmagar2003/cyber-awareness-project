import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../services/api";
import "../../styles/org-dashboard.css";

function ProgressBar({ value, color = "blue" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="od-progress">
      <div className="od-progress__track">
        <div
          className={`od-progress__fill od-progress__fill--${color}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <span className="od-progress__value">{safeValue}%</span>
    </div>
  );
}

function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`od-section-card ${className}`}>
      <div className="od-section-card__header">
        <div>
          <h2 className="od-section-card__title">{title}</h2>
          {subtitle && <p className="od-section-card__subtitle">{subtitle}</p>}
        </div>

        {action && <div className="od-section-card__action">{action}</div>}
      </div>

      {children}
    </section>
  );
}

export default function OrgAdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("Organization");
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedTopics: 0,
    avgQuizScore: 0,
    premiumModules: 0,
  });
  const [students, setStudents] = useState([]);
  const [moduleRows, setModuleRows] = useState([]);
  const [attentionStudents, setAttentionStudents] = useState([]);
  const [weakTopicRows, setWeakTopicRows] = useState([]);
  const [breakdownStats, setBreakdownStats] = useState({
    generalProgress: 0,
    premiumProgress: 0,
    combinedProgress: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);

        const res = await api.get("/organizations/dashboard");
        const payload = res?.data?.data || {};

        if (cancelled) return;

        const organization = payload?.organization || {};
        const apiStats = payload?.stats || {};

        const recentStudents = Array.isArray(payload?.recent_students)
          ? payload.recent_students
          : [];
        const allStudents = Array.isArray(payload?.all_students)
          ? payload.all_students
          : [];

        const studentsRes = await api.get("/organizations/students");
        const orgStudents = Array.isArray(studentsRes?.data?.data)
          ? studentsRes.data.data
          : [];

        const detailResults = await Promise.all(
          orgStudents.map(async (student) => {
            try {
              const detailRes = await api.get(
                `/organizations/students/${student.id}`
              );
              return detailRes?.data?.data || null;
            } catch (error) {
              console.error(
                `DASHBOARD DETAIL ERROR student ${student.id}:`,
                error
              );
              return null;
            }
          })
        );

        const studentDetails = detailResults.filter(Boolean);

        const allTopicRows = studentDetails.flatMap((detail) =>
          Array.isArray(detail?.topic_progress) ? detail.topic_progress : []
        );

        const generalTopicRows = allTopicRows.filter((row) => {
          const isPublic = Number(row.module_is_public || 0) === 1;
          const audienceType = row.module_audience_type || "general";
          return isPublic && audienceType === "general";
        });

        const premiumTopicRows = allTopicRows.filter((row) => {
          const isPublic = Number(row.module_is_public || 0) === 1;
          const audienceType = row.module_audience_type || "general";
          return !isPublic || audienceType === "organization";
        });

        const calcProgress = (rows) => {
          if (!rows.length) return 0;
          const completed = rows.filter(
            (row) => row.status === "completed"
          ).length;
          return Math.round((completed / rows.length) * 100);
        };

        setBreakdownStats({
          generalProgress: calcProgress(generalTopicRows),
          premiumProgress: calcProgress(premiumTopicRows),
          combinedProgress: calcProgress(allTopicRows),
        });

        const attentionRows = orgStudents
          .map((student) => ({
            id: student.id,
            name: student.full_name || "Student",
            email: student.email || "-",
            progress: Number(student.progress || 0),
            completedTopics: Number(student.completed_topics || 0),
            totalTopics: Number(student.total_topics || 0),
          }))
          .filter((student) => student.progress <= 50)
          .sort((a, b) => a.progress - b.progress)
          .slice(0, 5);

        setAttentionStudents(attentionRows);

        const weakTopicMap = new Map();

        allTopicRows.forEach((row) => {
          const key = row.topic_id;

          if (!weakTopicMap.has(key)) {
            weakTopicMap.set(key, {
              topic_id: row.topic_id,
              topic_title: row.topic_title || "Topic",
              module_title: row.module_title || "Module",
              total: 0,
              completed: 0,
            });
          }

          const current = weakTopicMap.get(key);
          current.total += 1;

          if (row.status === "completed") {
            current.completed += 1;
          }
        });

        const weakTopics = Array.from(weakTopicMap.values())
          .map((row) => ({
            ...row,
            completionRate:
              row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0,
          }))
          .sort((a, b) => a.completionRate - b.completionRate)
          .slice(0, 5);

        setWeakTopicRows(weakTopics);

        setOrgName(organization?.name || "Organization");

        setStats({
          totalStudents: Number(apiStats?.total_students || 0),
          activeStudents: Number(apiStats?.active_students || 0),
          completedTopics: Number(apiStats?.completed_topics || 0),
          avgQuizScore: Number(apiStats?.avg_quiz_score || 0),
          premiumModules: Number(apiStats?.premium_modules || 0),
        });

        const mappedStudents = recentStudents.map((student) => ({
          id: student.id,
          name: student.full_name || "Student",
          email: student.email || "-",
          status:
            student.status === "active"
              ? "Active"
              : student.status === "pending"
                ? "Pending"
                : "Inactive",
          progress: Number(student.progress || 0),
        }));

        setStudents(mappedStudents);

        const derivedModuleRows = allStudents
          .map((student) => ({
            module: student.full_name || "Student",
            completionRate: Number(student.progress || 0),
            students: `${Number(student.completed_topics || 0)}/${Number(
              student.total_topics || 0
            )} topics`,
          }))
          .sort((a, b) => b.completionRate - a.completionRate);

        setModuleRows(derivedModuleRows);
      } catch (error) {
        console.error("ORG DASHBOARD ERROR:", error);
        setOrgName("Organization");
        setStats({
          totalStudents: 0,
          activeStudents: 0,
          completedTopics: 0,
          avgQuizScore: 0,
          premiumModules: 0,
        });
        setStudents([]);
        setModuleRows([]);
        setAttentionStudents([]);
        setWeakTopicRows([]);
        setBreakdownStats({
          generalProgress: 0,
          premiumProgress: 0,
          combinedProgress: 0,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const studentColumns = useMemo(
    () => [
      {
        key: "name",
        label: "Student",
        render: (row) => (
          <div className="od-student-cell">
            <div className="od-student-cell__avatar">
              {(row.name || "S")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="od-student-cell__meta">
              <p className="od-student-cell__name">{row.name}</p>
              <p className="od-student-cell__email">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "progress",
        label: "Progress",
        render: (row) => (
          <ProgressBar
            value={row.progress}
            color={
              row.progress >= 80 ? "green" : row.progress >= 50 ? "blue" : "amber"
            }
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="od-page">
      <div className="od-page__header">
        <PageHeader
          title="Organization Dashboard"
          subtitle={`${orgName} — training overview`}
        />
      </div>

      <section className="od-hero">
  <div className="od-hero__content">
    <div>
      <p className="od-hero__eyebrow">Organization Summary</p>
      <h2 className="od-hero__title">Training Overview</h2>
      <p className="od-hero__subtitle">
        Monitor student participation, completion, and premium learning activity
        from one place.
      </p>
    </div>

    <div className="od-hero__badge">
      <span className="od-hero__badge-label">Organization</span>
      <strong className="od-hero__badge-value">{orgName}</strong>
    </div>
  </div>

  <div className="od-hero__stats">
    <div className="od-hero-stat">
      <span className="od-hero-stat__label">Total Students</span>
      <div className="od-hero-stat__row">
        <strong className="od-hero-stat__value">
          {loading ? "..." : stats.totalStudents}
        </strong>
        <span className="od-hero-stat__icon">🎓</span>
      </div>
    </div>

    <div className="od-hero-stat">
      <span className="od-hero-stat__label">Active Students</span>
      <div className="od-hero-stat__row">
        <strong className="od-hero-stat__value">
          {loading ? "..." : stats.activeStudents}
        </strong>
        <span className="od-hero-stat__icon">✅</span>
      </div>
    </div>

    <div className="od-hero-stat">
      <span className="od-hero-stat__label">Completed Topics</span>
      <div className="od-hero-stat__row">
        <strong className="od-hero-stat__value">
          {loading ? "..." : stats.completedTopics}
        </strong>
        <span className="od-hero-stat__icon">📚</span>
      </div>
    </div>

    <div className="od-hero-stat">
      <span className="od-hero-stat__label">Avg Quiz Score</span>
      <div className="od-hero-stat__row">
        <strong className="od-hero-stat__value">
          {loading ? "..." : `${stats.avgQuizScore}%`}
        </strong>
        <span className="od-hero-stat__icon">🧠</span>
      </div>
    </div>

    <div className="od-hero-stat">
      <span className="od-hero-stat__label">Premium Modules</span>
      <div className="od-hero-stat__row">
        <strong className="od-hero-stat__value">
          {loading ? "..." : stats.premiumModules}
        </strong>
        <span className="od-hero-stat__icon">🏢</span>
      </div>
    </div>
  </div>
</section>

      <SectionCard
        title="Student Progress Overview"
        subtitle="Current completion percentage of students in your organization"
      >
        <div className="od-stack">
          {moduleRows.length === 0 ? (
            <p className="od-empty-text">No student progress found.</p>
          ) : (
            moduleRows.slice(0, 8).map((row, index) => (
              <div key={`${row.module}-${index}`} className="od-progress-row">
                <div className="od-progress-row__top">
                  <span className="od-progress-row__label">{row.module}</span>
                  <span className="od-progress-row__meta">{row.students}</span>
                </div>

                <ProgressBar
                  value={row.completionRate}
                  color={
                    row.completionRate >= 80
                      ? "green"
                      : row.completionRate >= 50
                        ? "blue"
                        : "amber"
                  }
                />
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <div className="od-two-grid">
  <SectionCard
    title="Training Breakdown"
    subtitle="General, premium, and combined completion overview"
    className="od-panel-card od-panel-card--compact"
  >
    <div className="od-stack">
      <div className="od-progress-row">
        <div className="od-progress-row__top">
          <span className="od-progress-row__label">General Progress</span>
          <span className="od-progress-row__meta">
            {breakdownStats.generalProgress}%
          </span>
        </div>
        <ProgressBar value={breakdownStats.generalProgress} color="blue" />
      </div>

      <div className="od-progress-row">
        <div className="od-progress-row__top">
          <span className="od-progress-row__label">Premium Progress</span>
          <span className="od-progress-row__meta">
            {breakdownStats.premiumProgress}%
          </span>
        </div>
        <ProgressBar value={breakdownStats.premiumProgress} color="indigo" />
      </div>

      <div className="od-progress-row">
        <div className="od-progress-row__top">
          <span className="od-progress-row__label">Combined Progress</span>
          <span className="od-progress-row__meta">
            {breakdownStats.combinedProgress}%
          </span>
        </div>
        <ProgressBar value={breakdownStats.combinedProgress} color="green" />
      </div>
    </div>
  </SectionCard>

  <SectionCard
    title="Students Needing Attention"
    subtitle="Lowest-progress students in your organization"
    className="od-panel-card od-panel-card--compact"
  >
    <div className="od-list">
      {attentionStudents.length === 0 ? (
        <p className="od-empty-text">No low-progress students found.</p>
      ) : (
        attentionStudents.map((student) => (
          <div key={student.id} className="od-list__item">
            <div className="od-list__content">
              <p className="od-list__title">{student.name}</p>
              <p className="od-list__subtitle">
                {student.completedTopics}/{student.totalTopics} topics completed
              </p>
            </div>

            <span className="od-list__value od-list__value--amber">
              {student.progress}%
            </span>
          </div>
        ))
      )}
    </div>
  </SectionCard>
</div>

<SectionCard
  title="Weak Topics Needing Focus"
  subtitle="Topics with lowest completion rate"
  className="od-panel-card od-panel-card--wide"
>
  <div className="od-topic-grid">
    {weakTopicRows.length === 0 ? (
      <p className="od-empty-text">No weak topics found.</p>
    ) : (
      weakTopicRows.map((topic) => (
        <div key={topic.topic_id} className="od-topic-grid__item">
          <p className="od-list__title">{topic.topic_title}</p>
          <p className="od-list__subtitle">{topic.module_title}</p>
          <div className="od-topic-item__bar">
            <ProgressBar value={topic.completionRate} color="amber" />
          </div>
        </div>
      ))
    )}
  </div>
</SectionCard>

      <SectionCard
        title="Recent Students"
        subtitle="Latest student activity in your organization"
        action={
          <button
            onClick={() => navigate("/organization/students")}
            className="od-link-btn"
          >
            View all →
          </button>
        }
      >
        <DataTable
          columns={studentColumns}
          data={students}
          emptyMessage="No students found."
        />
      </SectionCard>
    </div>
  );
}