// Di file src/api/axios.js

import axios from 'axios';

// 1. GUNAKAN FUNGSI getCookie YANG LEBIH STABIL INI
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    // Cek apakah cookie dimulai dengan nama yang kita cari
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null; // Kembalikan null jika tidak ketemu
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  withCredentials: true, 
  headers: {
    'Accept': 'application/json',
  },
});

// 2. INTERCEPTOR (Ini masih sama, tapi sekarang akan pakai getCookie yang baru)
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token XSRF-TOKEN dari cookie
    const token = getCookie('XSRF-TOKEN');
    
    if (token) {
      // Jika token ada, tambahkan ke header
      config.headers['X-XSRF-TOKEN'] = token; // tidak perlu decodeURIComponent lagi
    }
    
    return config; // Lanjutkan request
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Fungsi getCsrfCookie (Ini masih sama)
export const getCsrfCookie = () => 
  apiClient.get('/sanctum/csrf-cookie');

export default apiClient;