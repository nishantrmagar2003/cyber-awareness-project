import api from "./api";

export const getSystemSettings = async () => {
  const res = await api.get("/system-settings");
  return res.data?.data;
};

export const updateSystemSettings = async (payload) => {
  const res = await api.put("/system-settings", payload);
  return res.data;
};