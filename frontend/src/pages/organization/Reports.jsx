import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import api from "../../services/api";
import "../../styles/reports.css";

function Bar({ value, max, color = "rpt-bar-fill--blue" }) {
  const safeValue = Number(value || 0);
  const safeMax = Number(max || 0);
  const pct = safeMax > 0 ? Math.round((safeValue / safeMax) * 100) : 0;

  return (
    <div className="rpt-bar">
      <div className="rpt-bar__track">
        <div
          className={`rpt-bar__fill ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="rpt-bar__value">{pct}%</span>
    </div>
  );
}

function getBarColor(percent) {
  if (percent >= 80) return "rpt-bar-fill--green";
  if (percent >= 60) return "rpt-bar-fill--blue";
  return "rpt-bar-fill--amber";
}

function SimpleBarChart({
  title,
  rows,
  labelKey,
  valueKey,
  color = "rpt-bar-fill--blue",
}) {
  const maxValue = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 0);

  return (
    <div className="rpt-chart-card">
      <h3 className="rpt-chart-card__title">{title}</h3>

      {rows.length === 0 ? (
        <p className="rpt-empty-text">No chart data found.</p>
      ) : (
        <div className="rpt-chart-list">
          {rows.map((row, index) => {
            const value = Number(row[valueKey] || 0);
            const width = Math.max(0, Math.min(100, value));

            return (
              <div key={`${row[labelKey]}-${index}`} className="rpt-chart-item">
                <div className="rpt-chart-item__top">
                  <p className="rpt-chart-item__label">{row[labelKey]}</p>
                  <span className="rpt-chart-item__value">{value}%</span>
                </div>

                <div className="rpt-chart-item__track">
                  <div
                    className={`rpt-chart-item__fill ${color}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
}

function getModuleType(row) {
  const isGeneral =
    Number(row.module_is_public || 0) === 1 &&
    row.module_audience_type === "general";

  return isGeneral ? "General" : "Premium";
}

export default function Reports() {
  const [tab, setTab] = useState("training");
  const [loading, setLoading] = useState(true);
  const [studentList, setStudentList] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);

  const [moduleTypeFilter, setModuleTypeFilter] = useState("All");
  const [studentFilter, setStudentFilter] = useState("All Students");

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        setLoading(true);

        const studentsRes = await api.get("/organizations/students");
        const students = Array.isArray(studentsRes?.data?.data)
          ? studentsRes.data.data
          : [];

        if (cancelled) return;
        setStudentList(students);

        const detailResults = await Promise.all(
          students.map(async (student) => {
            try {
              const detailRes = await api.get(
                `/organizations/students/${student.id}`
              );
              const detailData = detailRes?.data?.data || null;

              if (!detailData) return null;

              return {
                ...detailData,
                student: {
                  ...detailData.student,
                  full_name:
                    detailData?.student?.full_name ||
                    student.full_name ||
                    "Student",
                },
              };
            } catch (error) {
              console.error(`REPORT DETAIL ERROR student ${student.id}:`, error);
              return null;
            }
          })
        );

        if (cancelled) return;
        setStudentDetails(detailResults.filter(Boolean));
      } catch (error) {
        console.error("ORG REPORTS ERROR:", error);
        if (!cancelled) {
          setStudentList([]);
          setStudentDetails([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStudentDetails = useMemo(() => {
    return studentDetails.filter((detail) => {
      if (studentFilter === "All Students") return true;
      return detail?.student?.full_name === studentFilter;
    });
  }, [studentDetails, studentFilter]);

  const filteredStudentCount = filteredStudentDetails.length;

  const trainingRows = useMemo(() => {
    const moduleMap = new Map();

    filteredStudentDetails.forEach((detail) => {
      const topicProgress = Array.isArray(detail?.topic_progress)
        ? detail.topic_progress
        : [];

      const filteredTopicProgress = topicProgress.filter((row) => {
        const type = getModuleType(row);
        return moduleTypeFilter === "All" || type === moduleTypeFilter;
      });

      const moduleTopicMap = new Map();

      filteredTopicProgress.forEach((row) => {
        const moduleId = Number(row.module_id);
        const moduleTitle = row.module_title || `Module ${moduleId}`;
        const quizScore = Number(row.best_quiz_score || 0);
        const moduleType = getModuleType(row);

        if (!moduleTopicMap.has(moduleId)) {
          moduleTopicMap.set(moduleId, {
            moduleId,
            module: moduleTitle,
            moduleType,
            totalTopics: 0,
            completedTopics: 0,
            scoreSum: 0,
            scoreCount: 0,
          });
        }

        const current = moduleTopicMap.get(moduleId);
        current.totalTopics += 1;

        if (row.status === "completed") {
          current.completedTopics += 1;
        }

        if (!Number.isNaN(quizScore) && quizScore > 0) {
          current.scoreSum += quizScore;
          current.scoreCount += 1;
        }
      });

      moduleTopicMap.forEach((studentModule) => {
        if (!moduleMap.has(studentModule.moduleId)) {
          moduleMap.set(studentModule.moduleId, {
            module: studentModule.module,
            moduleType: studentModule.moduleType,
            enrolled: filteredStudentCount,
            completed: 0,
            scoreSum: 0,
            scoreCount: 0,
          });
        }

        const globalModule = moduleMap.get(studentModule.moduleId);

        const moduleCompleted =
          studentModule.totalTopics > 0 &&
          studentModule.completedTopics === studentModule.totalTopics;

        if (moduleCompleted) {
          globalModule.completed += 1;
        }

        globalModule.scoreSum += studentModule.scoreSum;
        globalModule.scoreCount += studentModule.scoreCount;
      });
    });

    return Array.from(moduleMap.values())
      .map((row) => ({
        module: row.module,
        moduleType: row.moduleType,
        enrolled: row.enrolled,
        completed: row.completed,
        completionRate:
          row.enrolled > 0 ? Math.round((row.completed / row.enrolled) * 100) : 0,
        avgScore:
          row.scoreCount > 0 ? Math.round(row.scoreSum / row.scoreCount) : 0,
      }))
      .sort((a, b) => b.completionRate - a.completionRate);
  }, [filteredStudentDetails, filteredStudentCount, moduleTypeFilter]);

  const quizRows = useMemo(() => {
    const quizMap = new Map();

    filteredStudentDetails.forEach((detail) => {
      const quizAttempts = Array.isArray(detail?.quiz_attempts)
        ? detail.quiz_attempts
        : [];

      const filteredQuizAttempts = quizAttempts.filter((row) => {
        const type = getModuleType(row);
        return moduleTypeFilter === "All" || type === moduleTypeFilter;
      });

      filteredQuizAttempts.forEach((row) => {
        const key = row.quiz_title || `Quiz ${row.quiz_id}`;
        const moduleType = getModuleType(row);

        if (!quizMap.has(key)) {
          quizMap.set(key, {
            quiz: key,
            moduleType,
            attempts: 0,
            passed: 0,
            scoreSum: 0,
          });
        }

        const current = quizMap.get(key);
        current.attempts += 1;
        current.scoreSum += Number(row.score || 0);

        const passedValue =
          row.passed === 1 ||
          row.passed === true ||
          row.passed === "1" ||
          row.passed === "true" ||
          String(row.passed).toLowerCase() === "passed";

        if (passedValue) {
          current.passed += 1;
        }
      });
    });

    return Array.from(quizMap.values())
      .map((row) => ({
        quiz: row.quiz,
        moduleType: row.moduleType,
        attempts: row.attempts,
        passed: row.passed,
        failed: row.attempts - row.passed,
        passRate:
          row.attempts > 0 ? Math.round((row.passed / row.attempts) * 100) : 0,
        avgScore:
          row.attempts > 0 ? Math.round(row.scoreSum / row.attempts) : 0,
      }))
      .sort((a, b) => b.passRate - a.passRate);
  }, [filteredStudentDetails, moduleTypeFilter]);

  const simulationRows = useMemo(() => {
    const simMap = new Map();

    filteredStudentDetails.forEach((detail) => {
      const simAttempts = Array.isArray(detail?.simulation_attempts)
        ? detail.simulation_attempts
        : [];

      const filteredSimAttempts = simAttempts.filter((row) => {
        const type = getModuleType(row);
        return moduleTypeFilter === "All" || type === moduleTypeFilter;
      });

      filteredSimAttempts.forEach((row) => {
        const key = row.simulation_title || `Simulation ${row.simulation_id}`;
        const moduleType = getModuleType(row);

        if (!simMap.has(key)) {
          simMap.set(key, {
            simulation: key,
            moduleType,
            attempts: 0,
            passed: 0,
            scoreSum: 0,
          });
        }

        const current = simMap.get(key);
        current.attempts += 1;
        current.scoreSum += Number(row.score || 0);

        const passedValue =
          row.is_passed === 1 ||
          row.is_passed === true ||
          row.is_passed === "1" ||
          row.is_passed === "true" ||
          String(row.is_passed).toLowerCase() === "passed";

        if (passedValue) {
          current.passed += 1;
        }
      });
    });

    return Array.from(simMap.values())
      .map((row) => ({
        simulation: row.simulation,
        moduleType: row.moduleType,
        attempts: row.attempts,
        passed: row.passed,
        failed: row.attempts - row.passed,
        passRate:
          row.attempts > 0 ? Math.round((row.passed / row.attempts) * 100) : 0,
        avgScore:
          row.attempts > 0 ? Math.round(row.scoreSum / row.attempts) : 0,
      }))
      .sort((a, b) => b.passRate - a.passRate);
  }, [filteredStudentDetails, moduleTypeFilter]);

  const trainingChartRows = useMemo(() => {
    return trainingRows.slice(0, 8).map((row) => ({
      label: row.module,
      value: row.completionRate,
    }));
  }, [trainingRows]);

  const quizChartRows = useMemo(() => {
    return quizRows.slice(0, 8).map((row) => ({
      label: row.quiz,
      value: row.avgScore,
    }));
  }, [quizRows]);

  const simulationChartRows = useMemo(() => {
    return simulationRows.slice(0, 8).map((row) => ({
      label: row.simulation,
      value: row.avgScore,
    }));
  }, [simulationRows]);

  const summaryCards = useMemo(() => {
    if (tab === "training") {
      const highest = trainingRows.length
        ? Math.max(...trainingRows.map((row) => row.avgScore))
        : 0;

      const lowest = trainingRows.length
        ? Math.min(...trainingRows.map((row) => row.avgScore))
        : 0;

      const totalCompleted = trainingRows.reduce(
        (sum, row) => sum + Number(row.completed || 0),
        0
      );

      return [
        { label: "Modules", value: trainingRows.length },
        { label: "Highest Avg Score", value: `${highest}%` },
        { label: "Lowest Avg Score", value: `${lowest}%` },
        { label: "Completed Modules", value: totalCompleted },
      ];
    }

    if (tab === "quizzes") {
      const highest = quizRows.length
        ? Math.max(...quizRows.map((row) => row.avgScore))
        : 0;

      const lowest = quizRows.length
        ? Math.min(...quizRows.map((row) => row.avgScore))
        : 0;

      const totalAttempts = quizRows.reduce(
        (sum, row) => sum + Number(row.attempts || 0),
        0
      );

      return [
        { label: "Quizzes", value: quizRows.length },
        { label: "Highest Avg Score", value: `${highest}%` },
        { label: "Lowest Avg Score", value: `${lowest}%` },
        { label: "Total Attempts", value: totalAttempts },
      ];
    }

    const highest = simulationRows.length
      ? Math.max(...simulationRows.map((row) => row.avgScore))
      : 0;

    const lowest = simulationRows.length
      ? Math.min(...simulationRows.map((row) => row.avgScore))
      : 0;

    const totalAttempts = simulationRows.reduce(
      (sum, row) => sum + Number(row.attempts || 0),
      0
    );

    return [
      { label: "Simulations", value: simulationRows.length },
      { label: "Highest Avg Score", value: `${highest}%` },
      { label: "Lowest Avg Score", value: `${lowest}%` },
      { label: "Total Attempts", value: totalAttempts },
    ];
  }, [tab, trainingRows, quizRows, simulationRows]);

  function handleExportCsv() {
    if (tab === "training") {
      downloadCsv("training-report.csv", trainingRows);
      return;
    }

    if (tab === "quizzes") {
      downloadCsv("quiz-report.csv", quizRows);
      return;
    }

    if (tab === "simulations") {
      downloadCsv("simulation-report.csv", simulationRows);
    }
  }

  const studentOptions = useMemo(() => {
    const names = studentDetails
      .map((detail) => detail?.student?.full_name)
      .filter(Boolean);

    return ["All Students", ...new Set(names)];
  }, [studentDetails]);

  return (
    <div className="rpt-page">
      <div className="rpt-page__header">
        <PageHeader
          title="Reports"
          subtitle="Training progress, quiz results, and simulation statistics"
          action={
            <button onClick={handleExportCsv} className="rpt-export-btn">
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          }
        />
      </div>

      <section className="rpt-hero">
        <div className="rpt-hero__content">
          <div>
            <p className="rpt-hero__eyebrow">Organization Reports</p>
            <h2 className="rpt-hero__title">Learning Performance Overview</h2>
            <p className="rpt-hero__subtitle">
              Analyze training completion, quiz outcomes, and simulation
              performance across your organization.
            </p>
          </div>

          <div className="rpt-hero__badge">
            <span className="rpt-hero__badge-label">Students Loaded</span>
            <strong className="rpt-hero__badge-value">
              {loading ? "..." : studentList.length}
            </strong>
          </div>
        </div>

        <div className="rpt-tabs">
          {["training", "quizzes", "simulations"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rpt-tab ${tab === t ? "rpt-tab--active" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="rpt-filter-card">
        <div className="rpt-filter-card__header">
          <div>
            <h3 className="rpt-filter-card__title">Filter Reports</h3>
            <p className="rpt-filter-card__subtitle">
              Narrow the report view by module type and individual student.
            </p>
          </div>
        </div>

        <div className="rpt-filter-grid">
          <div className="rpt-filter-field">
            <label className="rpt-label">Module Type</label>
            <select
              value={moduleTypeFilter}
              onChange={(e) => setModuleTypeFilter(e.target.value)}
              className="rpt-select"
            >
              <option value="All">All</option>
              <option value="General">General</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div className="rpt-filter-field">
            <label className="rpt-label">Student</label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="rpt-select"
            >
              {studentOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rpt-summary-grid">
        {summaryCards.map((card, index) => (
          <div key={`${card.label}-${index}`} className="rpt-summary-card">
            <p className="rpt-summary-card__label">{card.label}</p>
            <p className="rpt-summary-card__value">{card.value}</p>
          </div>
        ))}
      </section>

      {tab === "training" && (
        <section className="rpt-card">
          <div className="rpt-card__header">
            <div>
              <h2 className="rpt-card__title">Training Progress Report</h2>
              <p className="rpt-card__subtitle">
                Module completion and average scores
              </p>
            </div>
          </div>

          <SimpleBarChart
            title="Module Completion Chart"
            rows={trainingChartRows}
            labelKey="label"
            valueKey="value"
            color="rpt-bar-fill--blue"
          />

          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead>
                <tr>
                  {[
                    "Module",
                    "Type",
                    "Enrolled",
                    "Completed",
                    "Completion Rate",
                    "Avg Score",
                  ].map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="rpt-table__empty">
                      Loading report...
                    </td>
                  </tr>
                ) : trainingRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="rpt-table__empty">
                      No training report data found.
                    </td>
                  </tr>
                ) : (
                  trainingRows.map((row, index) => (
                    <tr key={`${row.module}-${index}`}>
                      <td className="rpt-table__strong">{row.module}</td>
                      <td>{row.moduleType}</td>
                      <td>{row.enrolled}</td>
                      <td>{row.completed}</td>
                      <td className="rpt-table__bar-cell">
                        <Bar
                          value={row.completed}
                          max={row.enrolled}
                          color={getBarColor(row.completionRate)}
                        />
                      </td>
                      <td>
                        <span
                          className={`rpt-score ${
                            row.avgScore >= 80
                              ? "rpt-score--good"
                              : row.avgScore >= 70
                                ? "rpt-score--mid"
                                : "rpt-score--low"
                          }`}
                        >
                          {row.avgScore}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "quizzes" && (
        <section className="rpt-card">
          <div className="rpt-card__header">
            <div>
              <h2 className="rpt-card__title">Quiz Performance Report</h2>
              <p className="rpt-card__subtitle">
                Pass rates and average scores per quiz
              </p>
            </div>
          </div>

          <SimpleBarChart
            title="Quiz Average Score Chart"
            rows={quizChartRows}
            labelKey="label"
            valueKey="value"
            color="rpt-bar-fill--green"
          />

          <div className="rpt-quiz-grid">
            {loading ? (
              <p className="rpt-empty-text">Loading report...</p>
            ) : quizRows.length === 0 ? (
              <p className="rpt-empty-text">No quiz report data found.</p>
            ) : (
              quizRows.map((row, index) => (
                <div key={`${row.quiz}-${index}`} className="rpt-quiz-card">
                  <p className="rpt-quiz-card__name">{row.quiz}</p>
                  <p className="rpt-quiz-card__type">{row.moduleType}</p>

                  <p
                    className={`rpt-quiz-card__avg ${
                      row.avgScore >= 80
                        ? "rpt-quiz-card__avg--good"
                        : row.avgScore >= 70
                          ? "rpt-quiz-card__avg--mid"
                          : "rpt-quiz-card__avg--low"
                    }`}
                  >
                    {row.avgScore}%
                  </p>

                  <p className="rpt-quiz-card__sub">
                    Avg score · Pass {row.passRate}%
                  </p>

                  <div className="rpt-quiz-card__bar">
                    <Bar
                      value={row.avgScore}
                      max={100}
                      color={getBarColor(row.avgScore)}
                    />
                  </div>

                  <div className="rpt-quiz-card__stats">
                    <div>Attempts: {row.attempts}</div>
                    <div>Passed: {row.passed}</div>
                    <div>Failed: {row.failed}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {tab === "simulations" && (
        <section className="rpt-card">
          <div className="rpt-card__header">
            <div>
              <h2 className="rpt-card__title">Simulation Statistics</h2>
              <p className="rpt-card__subtitle">
                Pass and fail rates across simulations
              </p>
            </div>
          </div>

          <SimpleBarChart
            title="Simulation Average Score Chart"
            rows={simulationChartRows}
            labelKey="label"
            valueKey="value"
            color="rpt-bar-fill--amber"
          />

          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead>
                <tr>
                  {[
                    "Simulation",
                    "Type",
                    "Attempts",
                    "Passed",
                    "Failed",
                    "Pass Rate",
                    "Avg Score",
                  ].map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="rpt-table__empty">
                      Loading report...
                    </td>
                  </tr>
                ) : simulationRows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="rpt-table__empty">
                      No simulation report data found.
                    </td>
                  </tr>
                ) : (
                  simulationRows.map((row, index) => (
                    <tr key={`${row.simulation}-${index}`}>
                      <td className="rpt-table__strong">{row.simulation}</td>
                      <td>{row.moduleType}</td>
                      <td>{row.attempts}</td>
                      <td className="rpt-count rpt-count--pass">{row.passed}</td>
                      <td className="rpt-count rpt-count--fail">{row.failed}</td>
                      <td className="rpt-table__bar-cell">
                        <Bar
                          value={row.passed}
                          max={row.attempts}
                          color={getBarColor(row.passRate)}
                        />
                      </td>
                      <td>
                        <span
                          className={`rpt-score ${
                            row.avgScore >= 80
                              ? "rpt-score--good"
                              : row.avgScore >= 70
                                ? "rpt-score--mid"
                                : "rpt-score--low"
                          }`}
                        >
                          {row.avgScore}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}