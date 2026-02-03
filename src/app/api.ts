import axios from "axios";

const rawEnv = import.meta.env.VITE_MS_API ?? "http://127.0.0.1:8080";
let sanitizedBase = rawEnv.endsWith("/") ? rawEnv.slice(0, -1) : rawEnv;

if (sanitizedBase.endsWith("/api")) {
  sanitizedBase = sanitizedBase.slice(0, -4);
}

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