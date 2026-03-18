
import api, { ok } from "./api";

export async function getTopicProgress() {
  try {
    const res = await api.get("/topics/progress");
    const data = res?.data || {};

    return {
      ...res,
      data: {
        total: data.total ?? 0,
        completed: data.completed ?? 0,
        nextTopic: data.nextTopic ?? null,
      },
    };
  } catch (error) {
    try {
      const res = await api.get("/modules/progress");
      const data = res?.data || {};
      return ok({
        total: data.total ?? 0,
        completed: data.completed ?? 0,
        nextTopic: data.nextTopic ?? null,
      });
    } catch {
      return ok({ total: 0, completed: 0, nextTopic: null });
    }
  }
}
