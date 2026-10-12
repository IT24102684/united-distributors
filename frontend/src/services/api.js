const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const AUTH_STORAGE_KEY = "united_distributors_auth";
const GUEST_TOKEN_KEY = "united_distributors_guest_token";

/*
 * Backend API request function
 */
export async function apiRequest(endpoint, options = {}) {
  const auth = getStoredAuth();

  const isFormData = options.body instanceof FormData;

const headers = {
  ...(isFormData
    ? {}
    : { "Content-Type": "application/json" }),
  ...(options.headers || {}),
};

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }

    throw new Error(
      data?.message || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

/*
 * Login information save කිරීම
 */
export function saveAuth(authData) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(authData),
  );
}

/*
 * Saved login information ලබා ගැනීම
 */
export function getStoredAuth() {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/*
 * Logout
 */
export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/*
 * Guest cart එක සඳහා browser එකට unique token එකක්
 */
export function getGuestToken() {
  let guestToken = localStorage.getItem(GUEST_TOKEN_KEY);

  if (!guestToken) {
    guestToken = `guest-${crypto.randomUUID()}`;

    localStorage.setItem(
      GUEST_TOKEN_KEY,
      guestToken,
    );
  }

  return guestToken;
}

/*
 * Guest cart customer account එකට merge වූ පසු token remove කිරීම
 */
export function clearGuestToken() {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}