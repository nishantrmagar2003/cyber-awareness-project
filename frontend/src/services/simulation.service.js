import api from "./api";

/* ========================================
   GET SIMULATION STATS
======================================== */
export async function getSimulationStats() {
  try {
    const res = await api.get("/simulations/stats");

    const payload = res?.data?.data || {};

    return {
      completed: Number(payload?.completed || 0),
      total: Number(payload?.total || payload?.completed || 0),
    };
  } catch (error) {
    console.error("Simulation stats error:", error);
    return {
      completed: 0,
      total: 0,
    };
  }
}

/* ========================================
   GET SIMULATIONS BY TOPIC
======================================== */
export async function getSimulationsByTopic(topicId) {
  try {
    const res = await api.get(`/simulations/topics/${topicId}/simulations`);
    return res?.data?.data || [];
  } catch (error) {
    console.error("Get simulations error:", error);
    return [];
  }
}

/* ========================================
   START SIMULATION (FIXED ✅)
======================================== */
export async function startSimulation(simulationId) {
  try {
    const res = await api.post(
      `/simulations/${simulationId}/start`,   // ✅ FIXED PATH
      {
        meta_json: {
          source: "frontend"
        }
      }
    );

    return res?.data?.data || null;

  } catch (error) {
    console.error("Start simulation error:", error.response?.data || error);
    throw error;
  }
}

/* ========================================
   SUBMIT SIMULATION (FIXED ✅)
======================================== */
export async function submitSimulation(attemptId, payload) {
  try {
    const res = await api.post(
      `/simulations/simulation-attempts/${attemptId}/submit`,
      payload
    );

    return res?.data?.data || null;
  } catch (error) {
    console.error("Submit simulation error:", error);
    throw error;
  }
}