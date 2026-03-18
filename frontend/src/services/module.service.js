
import api, { ok } from "./api";

export const getModules = () => api.get("/modules");
export const getModuleById = (id) => api.get(`/modules/${id}`);

export async function getModuleTopics(moduleId) {
  const modulesRes = await getModules();
  const modules = Array.isArray(modulesRes?.data) ? modulesRes.data : [];
  const match = modules.find((module) => String(module.id) === String(moduleId));
  return ok(match?.topics || []);
}
