import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.7:5267/api/",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const storage = sessionStorage.getItem("auth-storage");

  if (storage) {
    const { state } = JSON.parse(storage);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }

  return config;
});
