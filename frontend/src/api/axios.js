import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Auth endpoints that should NOT trigger the global 401 redirect
const AUTH_PATHS = ["/api/auth/login", "/api/auth/signup", "/api/auth/forgot-password"];

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally — but skip auth endpoints so their
// own error handling can display the message to the user.
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url || "";
    const isAuthRoute = AUTH_PATHS.some((p) => requestUrl.includes(p));

    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;
