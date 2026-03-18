
import api, { ok } from "./api";

export async function getSimulationStats() {
  try {
    const res = await api.get("/simulations/stats");
    const data = res?.data || {};
    return {
      ...res,
      data: {
        completed: data.completed ?? data.total_completed ?? 0,
      },
    };
  } catch {
    return ok({ completed: 0 });
  }
}

export const getTopicSimulations = (topicId) => api.get(`/topics/${topicId}/simulations`);
export const startSimulation = (simulationId) => api.post(`/simulations/${simulationId}/start`);
export const submitSimulationAttempt = (attemptId, payload) =>
  api.post(`/simulation-attempts/${attemptId}/submit`, payload);
