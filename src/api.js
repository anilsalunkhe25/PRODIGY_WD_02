const TOKEN_KEY = 'people-auth-token';
const USER_KEY = 'people-auth-user';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const getSavedUser = () => {
  const value = sessionStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
};
export const saveUser = (user) => sessionStorage.setItem(USER_KEY, JSON.stringify(user));
export const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body) headers.set('Content-Type', 'application/json');

  let response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach the server. Check that the API is running.');
  }

  if (response.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event('people:session-expired'));
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'The request could not be completed.');
  }
  if (response.status === 204) return null;
  return response.json();
}
