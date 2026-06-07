import { apiClient } from "./apiClient";

export type MessageKind = "text" | "image" | "shared_post" | "shared_profile" | "shared_job" | "shared_community" | string;

export interface ChatMessage {
  id: string;
  sender: { id: string; fullName: string; avatarUrl?: string };
  body: string;
  kind?: MessageKind;
  imageUrl?: string;
  sharedId?: string;
  sharedPayload?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}
export type ConversationKind = "direct" | "group" | "community" | "ai" | "broadcast";
export interface Conversation {
  id: string;
  kind?: ConversationKind;
  title?: string;
  displayTitle?: string;
  imageUrl?: string;
  participantCount?: number;
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
  async primary() {
    const { data } = await apiClient.get<{ results: Conversation[] }>("/conversations/?kind=primary");
    return data.results ?? (data as unknown as Conversation[]);
  },
  async accept(conversationId: string) {
    await apiClient.post(`/conversations/${conversationId}/accept/`);
  },
  async decline(conversationId: string) {
    await apiClient.post(`/conversations/${conversationId}/decline/`);
  },
  async start(userId: string) {
    const { data } = await apiClient.post<Conversation>("/conversations/", { userId });
    return data;
  },
  async get(conversationId: string) {
    const { data } = await apiClient.get<Conversation>(`/conversations/${conversationId}/`);
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
  // Send a shared card (post / profile / job / community) into a conversation.
  async sendShared(conversationId: string, payload: {
    kind: "shared_post" | "shared_profile" | "shared_job" | "shared_community";
    sharedId: string;
    sharedPayload?: Record<string, unknown>;
    body?: string;
  }) {
    const { data } = await apiClient.post<ChatMessage>(`/conversations/${conversationId}/messages/`, payload);
    return data;
  },
  // Conversations filtered by kind (group / community) for the share sheet.
  async byKind(kind: "group" | "community") {
    const { data } = await apiClient.get<{ results: Conversation[] }>(`/conversations/?kind=${kind}`);
    return data.results ?? (data as unknown as Conversation[]);
  },
  // Send an image attachment (multipart).
  async sendImage(conversationId: string, file: File, body = "") {
    const form = new FormData();
    form.append("image", file);
    if (body) form.append("body", body);
    const { data } = await apiClient.post<ChatMessage>(`/conversations/${conversationId}/messages/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
