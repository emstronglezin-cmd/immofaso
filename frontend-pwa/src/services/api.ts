import axios from 'axios';
import type { AuthResponse } from '../models/types';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://immofaso-backend.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

const TOKEN_KEY = 'immofaso_token';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeAuth(res: AuthResponse) {
  setToken(res.accessToken);
}

export function clearAuth() {
  setToken(null);
}

export { API_URL };