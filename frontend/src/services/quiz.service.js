
import api, { ok } from "./api";

export async function getQuizStats() {
  try {
    const res = await api.get("/quizzes/stats");
    const data = res?.data || {};
    return {
      ...res,
      data: {
        totalQuizzes: data.totalQuizzes ?? data.total_quizzes ?? 0,
        totalAttempts: data.totalAttempts ?? data.total_attempts ?? 0,
        averageScore: Math.round(data.averageScore ?? data.average_score ?? 0),
        weakArea: data.weakArea ?? null,
      },
    };
  } catch {
    return ok({ totalQuizzes: 0, totalAttempts: 0, averageScore: 0, weakArea: null });
  }
}

export const getQuizByTopicId = (topicId) => api.get(`/quizzes/topic/${topicId}`);
export const getQuizById = (quizId) => api.get(`/quizzes/${quizId}`);
export const submitQuiz = (quizId, payload) =>
  api.post(`/quizzes/${quizId}/submit`, payload);