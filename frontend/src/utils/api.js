import { redirectToLogin, isTokenExpired, clearAuthData } from "./auth";

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  if (token && isTokenExpired(token)){
      redirectToLogin();
      throw new Error('Session expired. Please login again.');
  }

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    throw new Error('Session expired. Please login again.');
  }

  return response;
} 