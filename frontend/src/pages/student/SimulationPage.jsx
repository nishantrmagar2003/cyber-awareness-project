import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../services/api";
import { startSimulation, submitSimulation } from "../../services/simulation.service";
import { simulationRegistry } from "../../simulations/simulationRegistry";

export default function SimulationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const SimulationComponent = simulationRegistry[simulation?.component_key];

  useEffect(() => {
    async function init() {
      try {
        console.log("🚀 Starting simulation:", id);

        const data = await startSimulation(id);

        console.log("✅ START RESPONSE:", data);

        if (!data || !data.attempt_id) {
          throw new Error("Invalid simulation start response");
        }

        setAttemptId(data.attempt_id);
        setSimulation(data?.simulation || null);
        setTopicId(data?.simulation?.topic_id || null);

      } catch (err) {
        console.error("❌ Simulation start error FULL:", err);
        alert(err?.response?.data?.error || "Failed to start simulation");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id]);

  async function handleComplete(payload = {}) {
    if (!attemptId || submitting) return;

    try {
      setSubmitting(true);

      const time_taken_seconds = Number(
        payload?.timeTaken || payload?.time_taken_seconds || 0
      );

      const score = Number(payload?.score || 100);
      const answers = payload?.answers;

      console.log("📤 SUBMIT PAYLOAD:", payload);

      if (
        Array.isArray(answers) &&
        answers.length > 0 &&
        answers.every((a) => a && a.scenario_id)
      ) {
        await submitSimulation(attemptId, {
          time_taken_seconds,
          answers,
        });
      } else {
        await api.post(
          `/simulations/simulation-attempts/${attemptId}/complete`,
          {
            time_taken_seconds,
            score,
          }
        );
      }

      console.log("✅ Simulation saved");

      if (topicId) {
        navigate(`/student/topic/${topicId}?refresh=${Date.now()}`, { replace: true });
      } else {
        navigate("/student/modules", { replace: true });
      }

    } catch (err) {
      console.error("❌ Simulation complete error:", err);
      alert(err?.response?.data?.error || "Failed to save simulation progress");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !simulation) return <div className="p-6">Loading...</div>;

  if (!SimulationComponent) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Simulation not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      {submitting && (
        <div className="mb-4 text-sm text-blue-600">
          Saving simulation progress...
        </div>
      )}

      <SimulationComponent
        attemptId={attemptId}
        onComplete={handleComplete}
      />
    </div>
  );
}