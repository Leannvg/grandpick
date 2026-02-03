import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("❌ VITE_API_URL no está definida");
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth-token");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  }
);

export default api;
