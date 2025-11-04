// src/api/apiClient.js
import axios from "axios";
import Cookies from "js-cookie"; // pastikan sudah di-install

// URL backend kamu (ganti kalau beda)
const apiClient = axios.create({
  baseURL: "http://192.168.0.24:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Tambahkan interceptor untuk menyertakan XSRF-TOKEN
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("XSRF-TOKEN");
  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }
  return config;
});

export const getCsrfCookie = () => apiClient.get("/sanctum/csrf-cookie");
export default apiClient;
