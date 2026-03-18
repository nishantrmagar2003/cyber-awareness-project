
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../../components/feedback/LoadingState";
import { getModules } from "../../services/module.service.js";
import "../../styles/modules.css";

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadModules() {
      try {
        setLoading(true);
        const res = await getModules();
        const items = Array.isArray(res?.data) ? res.data : [];

        if (!cancelled) {
          setModules(items);
          setError("");
        }
      } catch (err) {
        console.error("MODULE LOAD ERROR", err);
        if (!cancelled) {
          setError(err?.response?.data?.error || "Failed to load modules.");
          setModules([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadModules();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalTopics = useMemo(
    () => modules.reduce((sum, module) => sum + (module.topics?.length || 0), 0),
    [modules]
  );

  return (
    <div className="mod-page">
      <div className="mod-page__header">
        <div>
          <h1 className="mod-page__title">Learning Modules</h1>
          <p className="mod-page__subtitle">
            Learn cybersecurity topics step-by-step and continue where you left off.
          </p>
        </div>

        <div className="mod-page__summary">
          <span>{modules.length} modules</span>
          <span>{totalTopics} topics</span>
        </div>
      </div>

      {loading ? (
        <LoadingState
          title="Loading modules"
          subtitle="Fetching modules and topics from your backend."
        />
      ) : error ? (
        <div className="mod-card">
          <p className="mod-table__empty">{error}</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="mod-card">
          <p className="mod-table__empty">No modules available yet.</p>
        </div>
      ) : (
        modules.map((module) => {
          const topics = Array.isArray(module.topics) ? module.topics : [];

          return (
            <div key={module.id} className="mod-card">
              <div className="mod-card__top">
                <div>
                  <h2>{module.title}</h2>
                  <p className="mod-card__description">{module.description || "No description added yet."}</p>
                </div>

                <Link to={`/student/module/${module.id}`} className="mod-action">
                  Open module
                </Link>
              </div>

              <div className="mod-section">
                <div className="mod-section__head">
                  <strong>Topics</strong>
                  <span>{topics.length}</span>
                </div>

                {topics.length === 0 ? (
                  <div className="mod-topic-box">
                    <strong>No topics yet</strong>
                    <p>This module exists, but no topics were returned by the backend.</p>
                  </div>
                ) : (
                  topics.map((topic) => (
                    <div key={topic.id} className="mod-topic-box">
                      <div className="mod-topic-box__top">
                        <strong>{topic.title}</strong>
                        <Link to={`/student/topic/${topic.id}`} className="mod-topic-link">
                          View topic
                        </Link>
                      </div>

                      <div className="mod-chip-row">
                        <span className="mod-chip mod-chip--beginner">Video</span>
                        <span className="mod-chip mod-chip--intermediate">Quiz</span>
                        <span className="mod-chip mod-chip--expert">Simulation</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
