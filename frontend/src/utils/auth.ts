import axios from 'axios';
import { User } from '@/types';

// Create an axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - token:', token ? 'exists' : 'missing');
    console.log('Request URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.log('No token found, request will be unauthorized');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth utility functions
export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  if (!user || user === 'undefined' || user === 'null') {
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  await api.post("/users/logout");
  window.location.href = '/';
};

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}; 