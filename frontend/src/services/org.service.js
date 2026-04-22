
import api from "./api";

export const createOrganization = (payload) => api.post("/organizations/create", payload);
export const createOrganizationAdmin = (payload) => api.post("/organizations/create-admin", payload);
