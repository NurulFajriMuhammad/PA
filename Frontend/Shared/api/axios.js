import axios from 'axios';

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
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  withCredentials: true, 
  headers: {
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('XSRF-TOKEN');
    
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getCsrfCookie = () => 
  apiClient.get('/sanctum/csrf-cookie');

export default apiClient;