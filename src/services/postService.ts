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
};
