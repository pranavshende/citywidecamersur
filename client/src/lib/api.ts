/**
 * Centralized API helper.
 * 
 * - In LOCAL dev: VITE_API_URL is empty. Vite proxy forwards /api/* to localhost:5000.
 * - In PRODUCTION (Vercel): VITE_API_URL = https://your-backend.onrender.com
 */
const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || sessionStorage.getItem('anpr_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}
