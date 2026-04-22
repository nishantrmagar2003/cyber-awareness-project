import api from "./api";

export async function getStudentCertificates() {
  try {
    const res = await api.get("/certificates/my");
    const data = res?.data?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Certificates error:", error);
    return [];
  }
}