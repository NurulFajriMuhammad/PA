import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const getCsrfCookie = () => {
  return axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};
// const apiClient = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
//   headers: {
//     "X-Requested-With": "XMLHttpRequest",
//     "Accept": "application/json",
//   },
// });
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       sessionStorage.removeItem("isLoggedIn");
//     }
//     return Promise.reject(error);
//   }
// );

const apiClient = axios.create({
  baseURL: "http://192.168.0.28:8000/",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    contentType: "application/json",
  },
});


apiClient.interceptors.request.use((config) => {
  // const authToken = Cookies.get("auth_token");
  // if (authToken) {
  //   config.headers["Authorization"] = `Bearer ${authToken}`;
  // }
  // const authToken = localStorage.getItem("token");
  // if (authToken) {
  //   config.headers["Authorization"] = `Bearer ${authToken}`;
  // }

  // const xsrfToken = Cookies.get("XSRF-TOKEN");
  // if (xsrfToken) {
  //   config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
  // }
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

//   const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content 
//     || localStorage.getItem('csrf_token');
  
//   if (csrfToken) {
//     config.headers['X-CSRF-TOKEN'] = csrfToken;
//   }
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers['Authorization'] = `Bearer ${token}`;
//   }


//   return config;
// });

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 419) {
//       console.warn('CSRF Token expired');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// GET csrf cookie → tetap ke root, bukan /api
// export const getCsrfCookie = () =>
//   axios.get("http://192.168.1.9:8000/sanctum/csrf-cookie", {
//     withCredentials: true,
//   });

// Interceptor RESPONSE: Handle error
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


