import { apiClient } from "./apiClient";
import type { Paginated, Community, CommunityEvent, CommunityResource, User, Post } from "@/types";

export interface CommunityFilters { category?: string; search?: string; mine?: boolean }

export const communityService = {
  async list(filters: CommunityFilters = {}) {
    const { data } = await apiClient.get<Paginated<Community>>("/communities/", { params: filters });
    return data;
  },
  async suggestions() {
    const { data } = await apiClient.get<Community[]>("/communities/suggestions/");
    return data;
  },
  async get(id: string) {
    const { data } = await apiClient.get<Community>(`/communities/${id}/`);
    return data;
  },
  async join(id: string) {
    const { data } = await apiClient.post<{ detail: string; isMember: boolean; membersCount: number }>(`/communities/${id}/join/`);
    return data;
  },
  async leave(id: string) {
    const { data } = await apiClient.post<{ detail: string; isMember: boolean; membersCount: number }>(`/communities/${id}/leave/`);
    return data;
  },
  async posts(id: string) {
    const { data } = await apiClient.get<Post[]>(`/communities/${id}/posts/`);
    return data;
  },
  async createPost(id: string, body: string) {
    const { data } = await apiClient.post<Post>(`/communities/${id}/posts/`, { body });
    return data;
  },
  async members(id: string) {
    const { data } = await apiClient.get<User[]>(`/communities/${id}/members/`);
    return data;
  },
  async events(id: string) {
    const { data } = await apiClient.get<CommunityEvent[]>(`/communities/${id}/events/`);
    return data;
  },
  async createEvent(id: string, payload: Partial<CommunityEvent>) {
    const { data } = await apiClient.post<CommunityEvent>(`/communities/${id}/events/`, payload);
    return data;
  },
  async resources(id: string) {
    const { data } = await apiClient.get<CommunityResource[]>(`/communities/${id}/resources/`);
    return data;
  },
  async createResource(id: string, payload: Partial<CommunityResource>) {
    const { data } = await apiClient.post<CommunityResource>(`/communities/${id}/resources/`, payload);
    return data;
  },
  // Opens (or creates) the community group chat; returns the conversation.
  async openChat(id: string) {
    const { data } = await apiClient.post<{ id: string; title?: string }>(`/communities/${id}/chat/`);
    return data;
  },
};
