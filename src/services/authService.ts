import { apiClient } from "./apiClient";
import type { AuthTokens, User } from "@/types";

const ACCESS = "ujt_access";
const REFRESH = "ujt_refresh";

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<AuthTokens>("/auth/login/", { email, password });
    localStorage.setItem(ACCESS, data.access);
    localStorage.setItem(REFRESH, data.refresh);
    return data;
  },
  async register(payload: { fullName: string; username: string; email: string; password: string }) {
    // Backend returns the user plus a `detail` message about verification email.
    const { data } = await apiClient.post<User & { detail?: string }>("/auth/register/", payload);
    return data;
  },
  async me() {
    const { data } = await apiClient.get<User>("/auth/me/");
    return data;
  },

  // --- Email verification ---
  async verifyEmail(token: string) {
    const { data } = await apiClient.post<{ detail: string }>("/auth/email/verify/", { token });
    return data;
  },
  async resendVerification(email: string) {
    const { data } = await apiClient.post<{ detail: string }>("/auth/email/resend/", { email });
    return data;
  },

  // --- Password reset ---
  async requestPasswordReset(email: string) {
    const { data } = await apiClient.post<{ detail: string }>("/auth/password-reset/request/", { email });
    return data;
  },
  async confirmPasswordReset(token: string, password: string) {
    const { data } = await apiClient.post<{ detail: string }>("/auth/password-reset/confirm/", { token, password });
    return data;
  },

  // --- Google ---
  async googleLogin(idToken: string) {
    const { data } = await apiClient.post<AuthTokens & { needsUsername?: boolean }>("/auth/google/", { idToken });
    localStorage.setItem(ACCESS, data.access);
    localStorage.setItem(REFRESH, data.refresh);
    return data;
  },

  // --- Username ---
  async checkUsername(username: string) {
    const { data } = await apiClient.get<{ username: string; available: boolean; error: string | null }>(
      "/auth/username/check/", { params: { username } });
    return data;
  },
  async updateUsername(username: string) {
    const { data } = await apiClient.patch<User>("/auth/username/", { username });
    return data;
  },

  // --- Password ---
  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await apiClient.post<{ detail: string }>("/auth/change-password/", { currentPassword, newPassword });
    return data;
  },

  // --- Phone / WhatsApp ---
  async updatePhone(phoneCountryCode: string, phoneNumber: string) {
    const { data } = await apiClient.patch<User>("/profile/phone/", { phoneCountryCode, phoneNumber });
    return data;
  },
  async otpStatus() {
    const { data } = await apiClient.get<{ available: boolean; channel: string }>("/profile/phone/otp-status/");
    return data;
  },
  async requestPhoneOtp() {
    const { data } = await apiClient.post<{ detail: string; available?: boolean }>("/profile/phone/verify/request/", {});
    return data;
  },
  async confirmPhoneOtp(code: string) {
    const { data } = await apiClient.post<{ detail: string; isPhoneVerified?: boolean }>("/profile/phone/verify/confirm/", { code });
    return data;
  },
  async setWhatsappOptIn(whatsappOptIn: boolean) {
    const { data } = await apiClient.patch<User>("/profile/whatsapp-preferences/", { whatsappOptIn });
    return data;
  },
  async getPublicProfile(usernameOrId: string) {
    const { data } = await apiClient.get<User>(`/users/${usernameOrId}/profile/`);
    return data;
  },

  logout() {
    // Best-effort blacklist of the refresh token; never block the UI on it.
    const refresh = localStorage.getItem(REFRESH);
    if (refresh) {
      apiClient.post("/auth/logout/", { refresh }).catch(() => { /* already invalid */ });
    }
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
  async logoutAll() {
    try { await apiClient.post("/auth/logout-all/", {}); } catch { /* ignore */ }
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
