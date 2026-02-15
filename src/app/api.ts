import axios from "axios";
import { AuthStore } from "@/feature/auth/stores/auth-store";

const rawEnv = import.meta.env.VITE_MS_API;
const sanitizedBase = rawEnv.endsWith("/") ? rawEnv.slice(0, -1) : rawEnv;

export const api = axios.create({
  baseURL: `${sanitizedBase}/`,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const storage = sessionStorage.getItem("auth-storage");
  if (storage) {
    const { state } = JSON.parse(storage);
    if (state?.token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      const { logout } = AuthStore.getState();
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);