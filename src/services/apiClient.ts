import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ujt_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Auto-refresh on 401 using the refresh token ---
let isRefreshing = false;
let queue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

function flushQueue(error: unknown, token: string | null) {
  queue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  queue = [];
}

function logout() {
  localStorage.removeItem("ujt_access");
  localStorage.removeItem("ujt_refresh");
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ detail?: string }>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Try a single refresh on 401 (but never for the refresh/login calls themselves)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/refresh")
    ) {
      const refresh = localStorage.getItem("ujt_refresh");
      if (!refresh) { logout(); return Promise.reject(new Error("Session expired")); }

      if (isRefreshing) {
        // queue requests until refresh resolves
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token: string) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
        const newAccess = data.access as string;
        localStorage.setItem("ujt_access", newAccess);
        // Rotation is on: a new refresh token comes back and the old one is blacklisted.
        if (data.refresh) localStorage.setItem("ujt_refresh", data.refresh as string);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        flushQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      } catch (e) {
        flushQueue(e, null);
        logout();
        return Promise.reject(new Error("Session expired, please log in again"));
      } finally {
        isRefreshing = false;
      }
    }

    const data = error.response?.data as Record<string, unknown> | undefined;
    let message = data?.detail as string | undefined;
    if (!message && data && typeof data === "object") {
      // DRF field errors, e.g. { password: ["This password is too common."] }
      const first = Object.values(data)[0];
      if (Array.isArray(first)) message = String(first[0]);
      else if (typeof first === "string") message = first;
    }
    return Promise.reject(new Error(message ?? error.message ?? "Something went wrong"));
  },
);
