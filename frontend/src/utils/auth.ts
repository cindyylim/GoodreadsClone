import axios from 'axios';
import { removeCookie } from './cookies';
// Create an axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token expiration/auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      removeCookie('user');
      // Only redirect if not already on login/signup pages to avoid loops or bad UX
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth utility functions

export const logout = async () => {
  try {
    await api.post("/users/logout");
  } catch {
    console.error("Logout error");
  } finally {
    window.location.href = '/';
  }
};