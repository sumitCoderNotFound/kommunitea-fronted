import { apiClient } from "./apiClient";

export const moderationService = {
  async report(payload: { targetType: "post" | "comment" | "user"; targetId: number; reason: string; detail?: string }) {
    await apiClient.post("/reports/", payload);
  },
  async block(userId: string) { await apiClient.post(`/blocks/${userId}/block/`); },
  async unblock(userId: string) { await apiClient.post(`/blocks/${userId}/unblock/`); },
};
