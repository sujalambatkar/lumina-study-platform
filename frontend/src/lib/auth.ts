import { api } from "./api";

const TOKEN_KEY = "lumina_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  api.setToken(token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  api.setToken(null);
}

export function initAuthFromStorage(): void {
  const token = getStoredToken();
  if (token) {
    api.setToken(token);
  }
}
