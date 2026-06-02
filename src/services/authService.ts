import { apiClient } from "./apiClient";
import type { AuthTokens, User } from "@/types";

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<AuthTokens>("/auth/login/", { email, password });
    localStorage.setItem("ujt_access", data.access);
    localStorage.setItem("ujt_refresh", data.refresh);
    return data;
  },
  async register(payload: { fullName: string; email: string; password: string }) {
    const { data } = await apiClient.post<User>("/auth/register/", payload);
    return data;
  },
  async me() {
    const { data } = await apiClient.get<User>("/auth/me/");
    return data;
  },
  logout() {
    localStorage.removeItem("ujt_access");
    localStorage.removeItem("ujt_refresh");
  },
};
