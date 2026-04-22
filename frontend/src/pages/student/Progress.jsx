import { useEffect, useMemo, useState } from "react";
import { getProgress } from "../../services/progress.service";
import "../../styles/progress.css";

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      try {
        setLoading(true);
        const data = await getProgress();

        if (!cancelled) {
          setProgress({
            total: Number(data?.total || 0),
            completed: Number(data?.completed || 0),
          });
        }
      } catch (err) {
        console.error("Progress page error:", err);

        if (!cancelled) {
          setProgress({
            total: 0,
            completed: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, []);

  const percent = useMemo(() => {
    if (!progress.total) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  }, [progress]);

  const status =
    progress.completed === 0
      ? "Not Started"
      : percent >= 100
      ? "Completed"
      : "In Progress";

  return (
    <div className="student-progress-page">
      <div className="student-progress-wrap">
        <section className="student-progress-hero">
          <div className="student-progress-hero__content">
            <p className="student-progress-eyebrow">Learning Tracker</p>
            <h1 className="student-progress-title">Learning Progress</h1>
            <p className="student-progress-subtitle">
              Track your cybersecurity learning progress and see how far you
              have come.
            </p>
          </div>

          <div className="student-progress-stats">
            <div className="student-progress-stat-card">
              <span>Total Topics</span>
              <strong>{progress.total}</strong>
            </div>

            <div className="student-progress-stat-card">
              <span>Completed</span>
              <strong>{progress.completed}</strong>
            </div>

            <div className="student-progress-stat-card student-progress-stat-card--blue">
              <span>Progress</span>
              <strong>{percent}%</strong>
            </div>

            <div className="student-progress-stat-card student-progress-stat-card--green">
              <span>Status</span>
              <strong>{status}</strong>
            </div>
          </div>
        </section>

        <section className="student-progress-card">
          <div className="student-progress-card__top">
            <div>
              <p className="student-progress-card__eyebrow">Overall Progress</p>
              <h2 className="student-progress-card__title">
                Your learning completion
              </h2>
            </div>

            {!loading && (
              <div
              className="student-progress-percent-circle"
              style={{ "--progress": percent }}
            >
                <span>{percent}%</span>
              </div>
            )}
          </div>

          {loading ? (
            <p className="student-progress-loading">Loading progress...</p>
          ) : (
            <>
              <div className="student-progress-bar">
                <div
                  className="student-progress-bar__fill"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="student-progress-details">
                <div className="student-progress-detail-box">
                  <span>Topics finished</span>
                  <strong>
                    {progress.completed} / {progress.total}
                  </strong>
                </div>

                <div className="student-progress-detail-box">
                  <span>Completion</span>
                  <strong>{percent}%</strong>
                </div>

                <div className="student-progress-detail-box">
                  <span>Current status</span>
                  <strong>{status}</strong>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}