import api from "./api";

/* ========================================
   STUDENT BADGES
======================================== */
export async function getStudentBadges() {
  try {
    const res = await api.get("/rewards/badges");
    const payload = res?.data?.data || [];
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error("Get student badges error:", error);
    return [];
  }
}

/* ========================================
   SUPERADMIN BADGES
======================================== */
export async function getAdminBadges() {
  try {
    const res = await api.get("/rewards/admin/badges");
    const payload = res?.data?.data || [];
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error("Get admin badges error:", error);
    return [];
  }
}

export async function createBadge(payload) {
  try {
    const res = await api.post("/rewards/admin/badges", payload);
    return res?.data?.data || null;
  } catch (error) {
    console.error("Create badge error:", error);
    throw error;
  }
}

export async function updateBadge(badgeId, payload) {
  try {
    const res = await api.put(`/rewards/admin/badges/${badgeId}`, payload);
    return res?.data?.data || null;
  } catch (error) {
    console.error("Update badge error:", error);
    throw error;
  }
}

export async function deleteBadge(badgeId) {
  try {
    const res = await api.delete(`/rewards/admin/badges/${badgeId}`);
    return res?.data?.data || null;
  } catch (error) {
    console.error("Delete badge error:", error);
    throw error;
  }
}