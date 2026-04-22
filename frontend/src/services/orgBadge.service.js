import api from "./api";

export const getOrgBadgeStats = async () => {
  const res = await api.get("/org-badges/stats");
  return res.data?.data;
};

export const getOrgBadges = async () => {
  const res = await api.get("/org-badges");
  return res.data?.data || [];
};

export const createOrgBadge = async (payload) => {
  const res = await api.post("/org-badges", payload);
  return res.data;
};

export const getGeneralBadgesList = async () => {
  const res = await api.get("/org-badges/general-list");
  return res.data?.data || [];
};

export const getMyOrgBadges = async () => {
  const res = await api.get("/org-badges/student/my-badges");
  return res.data?.data || [];
};