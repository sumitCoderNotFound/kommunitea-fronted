import { apiClient } from "./apiClient";
import type { User } from "@/types";

export const profileService = {
  async list(params: { search?: string; page?: number } = {}) {
    const { data } = await apiClient.get<import("@/types").Paginated<User>>("/profiles/", { params });
    return data;
  },
  async getById(id: string) {
    const { data } = await apiClient.get<User>(`/profiles/${id}/`);
    return data;
  },
  async completeOnboarding(payload: Partial<User>) {
    const { data } = await apiClient.patch<User>("/profiles/me/", { ...payload, isOnboarded: true });
    return data;
  },
  async downloadMyData() {
    const { data } = await apiClient.get("/auth/my-data/");
    return data;
  },
  async deleteAccount() {
    await apiClient.delete("/auth/delete-account/");
  },
  async update(payload: Partial<User>) {
    const { data } = await apiClient.patch<User>("/profiles/me/", payload);
    return data;
  },
  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    const { data } = await apiClient.patch<User>("/profiles/me/avatar/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async search(q: string) {
    const { data } = await apiClient.get<import("@/types").Paginated<User>>("/profiles/", { params: { search: q } });
    return data;
  },
  async myRequests() {
    const { data } = await apiClient.get<import("@/types").FollowRequestItem[]>("/profiles/requests/");
    return data;
  },
  async acceptRequest(fromUserId: string) {
    await apiClient.post(`/profiles/${fromUserId}/accept-request/`);
  },
  async rejectRequest(fromUserId: string) {
    await apiClient.post(`/profiles/${fromUserId}/reject-request/`);
  },
  async follow(id: string) { const { data } = await apiClient.post(`/profiles/${id}/follow/`); return data; },
  async unfollow(id: string) { await apiClient.post(`/profiles/${id}/unfollow/`); },
};
