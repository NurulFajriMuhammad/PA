import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://pa.test/api', // <-- PENTING: Sesuaikan dengan URL backend Anda
//   baseURL: 'http://backend.test/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json'
  }
});

export default apiClient;