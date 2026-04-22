import api from "./api";

/* ===============================
   GET OVERALL PROGRESS
================================ */
export async function getProgress() {
  try {
    const res = await api.get("/progress");

    const payload = res?.data?.data || {};

    return {
      total: Number(payload?.total || 0),
      completed: Number(payload?.completed || 0),
    };
  } catch (error) {
    console.error("Progress error:", error);
    return {
      total: 0,
      completed: 0,
    };
  }
}

/* ===============================
   GET SINGLE TOPIC PROGRESS
================================ */
export async function getTopicProgress(topicId) {
  try {
    const res = await api.get(`/progress/topic/${topicId}`);
    return res?.data?.data || null;
  } catch (error) {
    console.error("Topic progress error:", error);
    return null;
  }
}

/* ===============================
   GET MODULE PROGRESS
================================ */
export async function getModuleProgress(moduleId) {
  try {
    const res = await api.get(`/progress/module/${moduleId}`);
    return res?.data?.data || null;
  } catch (error) {
    console.error("Module progress error:", error);
    return null;
  }
}