import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LoadingState from "../../components/feedback/LoadingState";
import { getModules } from "../../services/module.service.js";
import "../../styles/modules.css";

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
  
    async function loadModules() {
      try {
        setLoading(true);
  
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const currentRole = user?.role || null;
  
        if (!cancelled) {
          setRole(currentRole);
        }
  
        const data = await getModules();
  
        console.log("MODULE DATA:", data);
  
        if (!cancelled) {
          setModules(Array.isArray(data) ? data : []);
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
  }, [location.pathname, location.search]);

  const totalTopics = useMemo(
    () => modules.reduce((sum, module) => sum + (module.topics?.length || 0), 0),
    [modules]
  );

  const generalModules = useMemo(() => {
    return modules.filter(
      (module) =>
        Number(module.is_public) === 1 &&
        module.audience_type === "general"
    );
  }, [modules]);

  const premiumModules = useMemo(() => {
    return modules.filter(
      (module) =>
        Number(module.is_public) === 0 &&
        module.audience_type === "organization"
    );
  }, [modules]);

  function renderModuleCard(module) {
    const topics = Array.isArray(module.topics) ? module.topics : [];
    const unlocked = Number(module.is_unlocked) === 1;

    return (
      <div key={module.id} className="mod-card">
        <div className="mod-card__top">
          <div>
            <h2>{module.title}</h2>
            <p className="mod-card__description">
              {module.description || "No description added yet."}
            </p>
          </div>

          <Link to={`/student/module/${module.id}`} className="mod-action">
            {unlocked ? "Open module" : "Start module"}
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

                  {unlocked ? (
                    <Link
                      to={`/student/topic/${topic.id}`}
                      className="mod-topic-link"
                    >
                      View topic
                    </Link>
                  ) : (
                    <button
                      onClick={() => alert("Complete Pre-Assessment first")}
                      className="mod-topic-link"
                      style={{
                        opacity: 0.5,
                        cursor: "not-allowed",
                        border: "none",
                        background: "#ccc"
                      }}
                    >
                      Locked
                    </button>
                  )}
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
  }

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
        <>
          {generalModules.length > 0 && (
            <div className="mod-section-block">
              <div className="mod-page__header" style={{ marginBottom: "12px" }}>
                <div>
                  <h2 className="mod-page__title" style={{ fontSize: "1.4rem" }}>
                    General Modules
                  </h2>
                  <p className="mod-page__subtitle">
                    Available for all students.
                  </p>
                </div>
              </div>

              {generalModules.map(renderModuleCard)}
            </div>
          )}

          {role === "org_student" && premiumModules.length > 0 && (
            <div className="mod-section-block">
              <div className="mod-page__header" style={{ marginBottom: "12px" }}>
                <div>
                  <h2 className="mod-page__title" style={{ fontSize: "1.4rem" }}>
                    Premium Organization Modules
                  </h2>
                  <p className="mod-page__subtitle">
                    Available only for organization students.
                  </p>
                </div>
              </div>

              {premiumModules.map(renderModuleCard)}
            </div>
          )}
        </>
      )}
    </div>
  );
}