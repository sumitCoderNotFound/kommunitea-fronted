import { apiClient } from "./apiClient";
import type { Paginated, Story } from "@/types";

export const storyService = {
  async list() {
    const { data } = await apiClient.get<Paginated<Story>>("/stories/");
    return data;
  },
  async create(payload: { image: File; caption?: string }) {
    const form = new FormData();
    form.append("image", payload.image);
    if (payload.caption) form.append("caption", payload.caption);
    const { data } = await apiClient.post<Story>("/stories/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async remove(id: string) {
    await apiClient.delete(`/stories/${id}/`);
  },
};
