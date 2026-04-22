
import api from "./api";

export const markVideoComplete = (topicId, payload = {}) =>
  api.post(`/topics/${topicId}/video-complete`, payload);
