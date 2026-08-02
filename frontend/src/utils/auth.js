export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user-store');
}

export function redirectToLogin(){
  clearAuthData();

  if (window.location.pathname !== '/login'){
    window.location.href = '/login';
  }
}


// Utility for making authenticated API requests with JWT
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  if (token && isTokenExpired(token)){
    redirectToLogin();
    throw new Error('Session expired. Please login again.');
  }

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
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

// JWT expiry check utility
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    if (!decoded.exp) return true;
    // exp is in seconds, Date.now() in ms
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)){
    clearAuthData();
    return false;
  }

  return true;
} 