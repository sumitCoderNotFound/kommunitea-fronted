import { apiClient } from "./apiClient";

export interface ChatMessage {
  id: string;
  sender: { id: string; fullName: string; avatarUrl?: string };
  body: string;
  isRead: boolean;
  createdAt: string;
}
export interface Conversation {
  id: string;
  otherUser: { id: string; fullName: string; avatarUrl?: string; university?: string } | null;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
  isRequest?: boolean;
  initiatorId?: string;
}

export const messageService = {
  async conversations() {
    const { data } = await apiClient.get<{ results: Conversation[] }>("/conversations/");
    return data.results ?? (data as unknown as Conversation[]);
  },
  async requests() {
    const { data } = await apiClient.get<{ results: Conversation[] }>("/conversations/?requests=true");
    return data.results ?? (data as unknown as Conversation[]);
  },
  async accept(conversationId: string) {
    await apiClient.post(`/conversations/${conversationId}/accept/`);
  },
  async start(userId: string) {
    const { data } = await apiClient.post<Conversation>("/conversations/", { userId });
    return data;
  },
  async messages(conversationId: string) {
    const { data } = await apiClient.get<ChatMessage[]>(`/conversations/${conversationId}/messages/`);
    return data;
  },
  async send(conversationId: string, body: string) {
    const { data } = await apiClient.post<ChatMessage>(`/conversations/${conversationId}/messages/`, { body });
    return data;
  },
};
