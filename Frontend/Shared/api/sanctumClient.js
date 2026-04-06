import axios from "axios";

const sanctumClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export const getCsrfCookie = () => {
  return sanctumClient.get("/sanctum/csrf-cookie");
};

export default sanctumClient;