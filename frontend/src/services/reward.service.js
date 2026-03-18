
import api, { ok } from "./api";

export async function getStudentBadges() {
  try {
    return await api.get("/rewards/badges");
  } catch {
    return ok([]);
  }
}
