import axios from 'axios';

// Fungsi ambil cookie manual
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://192.168.1.25:8000", 
  withCredentials: true, 
  headers: {
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // 1. Kirim XSRF Token (Untuk Laravel Sanctum)
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }
    
    // 2. Kirim Bearer Token (Untuk Autentikasi API)
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Auth Token attached to request');
    } else {
      console.warn('⚠️ No auth token found in localStorage');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Unauthorized - Redirecting to login');
      // Opsional: hapus token yang rusak
      // localStorage.clear();
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export const getCsrfCookie = () => apiClient.get('/sanctum/csrf-cookie');

export default apiClient;