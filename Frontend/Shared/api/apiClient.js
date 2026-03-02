import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const getCsrfCookie = () => {
  return axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};

const apiClient = axios.create({
  baseURL: "http://192.168.1.30:8000/",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    contentType: "application/json",
  },
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') 
    || localStorage.getItem('token')

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Request to:', config.baseURL + config.url);
  } else {
    console.warn('⚠️ No token found');
  }
  return config;
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Unauthorized');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;


