import api, { ok } from "./api";

export async function getTopicProgress() {
  try {
    const res = await api.get("/progress");
    const payload = res?.data || {};

    return {
      ...res,
      data: {
        total: payload.total ?? 0,
        completed: payload.completed ?? 0,
        nextTopic: null,
      },
    };
  } catch {
    return ok({
      total: 0,
      completed: 0,
      nextTopic: null,
    });
  }
}