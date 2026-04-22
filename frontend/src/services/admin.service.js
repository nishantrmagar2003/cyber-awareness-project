import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const apiRoot = rawBaseUrl.replace(/\/api\/?$/, "");

export const getHealth = () => axios.get(`${apiRoot}/health`);