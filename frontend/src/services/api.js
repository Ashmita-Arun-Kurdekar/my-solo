import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add JWT Token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;