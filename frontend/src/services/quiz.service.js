import api from "./api";

export async function getQuizStats() {
  try {
    const res = await api.get("/quizzes/stats");

    const payload = res?.data?.data || {};

    return {
      averageScore: Number(payload?.averageScore || 0),
      totalQuizzes: Number(payload?.totalQuizzes || 0),
      totalAttempts: Number(payload?.totalAttempts || 0),
      weakArea: payload?.weakArea || null,
    };
  } catch (error) {
    console.error("Quiz stats error:", error);
    return {
      averageScore: 0,
      totalQuizzes: 0,
      totalAttempts: 0,
      weakArea: null,
    };
  }
}

export async function getPreAssessmentByModuleId(moduleId) {
  const res = await api.get(`/quizzes/module/${moduleId}/pre-assessment`);
  return res?.data?.data || null;
}

export async function getQuizByTopicId(topicId) {
  const res = await api.get(`/quizzes/topic/${topicId}`);
  return res?.data?.data || null;
}

export async function getQuizById(quizId) {
  const res = await api.get(`/quizzes/${quizId}`);
  return res?.data?.data || null;
}

export async function submitQuiz(quizId, payload) {
  const res = await api.post(`/quizzes/${quizId}/submit`, payload);
  return res?.data?.data || null;
}