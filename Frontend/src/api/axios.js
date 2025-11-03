import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
});

export const getCsrfCookie = () => 
  apiClient.get('/sanctum/csrf-cookie'); // gunakan apiClient agar cookie-nya tersinkron

export default apiClient;
