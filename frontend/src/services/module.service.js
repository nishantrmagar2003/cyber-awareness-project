import api from "./api";

/* ===============================
   GET MODULES BY USER ROLE
================================ */
export async function getModules() {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const role = user?.role || null;

    let endpoints = ["/modules/general"];

    // org student can see premium too
    if (role === "org_student") {
      endpoints = ["/modules/general", "/modules/premium"];
    }

    const results = await Promise.allSettled(
      endpoints.map((endpoint) => api.get(endpoint))
    );

    const allModules = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        const modules = result.value?.data?.data || [];
        if (Array.isArray(modules)) {
          allModules.push(...modules);
        }
      }
    }

    // remove duplicate module ids just in case
    const uniqueModules = [];
    const seen = new Set();

    for (const module of allModules) {
      if (!seen.has(module.id)) {
        seen.add(module.id);
        uniqueModules.push(module);
      }
    }

    return uniqueModules;
  } catch (error) {
    console.error("Modules error:", error);
    return [];
  }
}

/* ===============================
   GET MODULE BY ID
================================ */
export async function getModuleById(id) {
  try {
    const res = await api.get(`/modules/${id}`);
    return res?.data?.data || null;
  } catch (error) {
    console.error("Module error:", error);
    return null;
  }
}

/* ===============================
   GET TOPICS BY MODULE
================================ */
export async function getModuleTopics(moduleId) {
  try {
    const res = await api.get(`/topics/module/${moduleId}`);
    return res?.data?.data || [];
  } catch (error) {
    console.error("Topics error:", error);
    return [];
  }
}