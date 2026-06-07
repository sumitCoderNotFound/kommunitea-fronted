import { apiClient } from "./apiClient";
import type { Paginated, Post, PostCategory } from "@/types";

export interface PostFilters { category?: PostCategory; search?: string; page?: number; }

export const postService = {
  async list(filters: PostFilters = {}) {
    const { data } = await apiClient.get<Paginated<Post>>("/posts/", { params: filters });
    return data;
  },
  async getById(id: string) {
    const { data } = await apiClient.get<Post>(`/posts/${id}/`);
    return data;
  },
  // Image upload uses multipart/form-data
  async create(payload: { body: string; category: PostCategory; image?: File | null }) {
    const form = new FormData();
    form.append("body", payload.body);
    form.append("category", payload.category);
    if (payload.image) form.append("image", payload.image);
    const { data } = await apiClient.post<Post>("/posts/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async toggleLike(id: string) {
    const { data } = await apiClient.post<Post>(`/posts/${id}/like/`);
    return data;
  },
  async toggleSave(id: string) {
    const { data } = await apiClient.post<Post>(`/posts/${id}/save/`);
    return data;
  },
  async comment(id: string, body: string) {
    const { data } = await apiClient.post(`/posts/${id}/comments/`, { body });
    return data;
  },
  async myPosts() {
    const { data } = await apiClient.get<Paginated<Post>>("/posts/", { params: { mine: true } });
    return data;
  },
  // Repost, optionally with a comment. Returns the updated post.
  async reshare(id: string, commentText?: string) {
    const { data } = await apiClient.post<Post>(`/posts/${id}/reshare/`, { commentText: commentText ?? "" });
    return data;
  },
  async unreshare(id: string) {
    const { data } = await apiClient.post<Post>(`/posts/${id}/unreshare/`);
    return data;
  },
  async addToStory(id: string, caption?: string) {
    const { data } = await apiClient.post<{ detail: string; storyId: number }>(`/posts/${id}/add-to-story/`, { caption: caption ?? "" });
    return data;
  },
  // Reshare-aware home feed (array, includes "X reposted" attribution).
  async feed() {
    const { data } = await apiClient.get<Post[]>("/posts/feed/");
    return data;
  },
  // Posts a user has reshared — powers the profile Reposts tab.
  async resharesByUser(userId: string) {
    const { data } = await apiClient.get<Post[]>("/posts/reshares/", { params: { user: userId } });
    return data;
  },
  // A user's own posts (privacy-gated server-side) — powers the profile Posts/Media tabs.
  async postsByUser(userId: string) {
    const { data } = await apiClient.get<Paginated<Post>>("/posts/", { params: { author: userId } });
    return data;
  },
  // Posts a user is tagged in — powers the profile Tagged tab.
  async taggedByUser(userId: string) {
    const { data } = await apiClient.get<Post[]>("/posts/tagged/", { params: { user: userId } });
    return data;
  },
};
