import { apiClient } from "./apiClient";

export interface AppNotification {
  id: string;
  actor: { id: string; fullName: string; avatarUrl?: string };
  verb: "like" | "comment" | "follow" | "request" | "message";
  verbDisplay: string;
  text: string;
  postId: number | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async list() {
    const { data } = await apiClient.get<{ results: AppNotification[] }>("/notifications/");
    return data.results ?? (data as unknown as AppNotification[]);
  },
  async unreadCount() {
    const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count/");
    return data.count;
  },
  async readAll() {
    await apiClient.post("/notifications/read-all/");
  },
};
