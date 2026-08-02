// src/utils/getAuthHeaders.js
export function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  }