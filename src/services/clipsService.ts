import { apiClient } from "./apiClient";

export interface ClipAuthor {
  id: string; fullName: string; username?: string | null; avatarUrl?: string | null;
}
export interface ClipContextAction {
  type: "accommodation" | "job" | "university" | "course" | "study" | "visa" | "city" | "community";
  label: string;
  jobId?: number; universityId?: number; courseId?: number; communityId?: number; citySlug?: string | null;
}
export interface Clip {
  id: number;
  user: ClipAuthor;
  caption: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number;
  category: string;
  visibility: string;
  tags: string[];
  status: string;
  community: number | null;
  relatedJob: number | null;
  relatedUniversity: number | null;
  relatedCourse: number | null;
  relatedCitySlug: string;
  viewsCount: number;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isFollowingCreator: boolean;
  contextAction: ClipContextAction | null;
  createdAt: string;
}
export interface ClipComment {
  id: number; author: ClipAuthor; body: string; createdAt: string;
}

export const CLIP_CATEGORIES = [
  { value: "", label: "For You" },
  { value: "uk_life", label: "UK Life" },
  { value: "jobs", label: "Jobs" },
  { value: "accommodation", label: "Accommodation" },
  { value: "study", label: "Study" },
  { value: "visa", label: "Visa" },
  { value: "career", label: "Career" },
  { value: "projects", label: "Projects" },
  { value: "city_guides", label: "City Guides" },
  { value: "community", label: "Community" },
] as const;

export const clipsService = {
  async feed(category = "") {
    const params = category ? { category } : {};
    return (await apiClient.get<{ clips: Clip[]; count: number }>("/clips/feed/", { params })).data;
  },
  async explore(params: { search?: string; category?: string } = {}) {
    return (await apiClient.get<{ clips: Clip[]; count: number }>("/clips/explore/", { params })).data;
  },
  async get(id: number) {
    return (await apiClient.get<Clip>(`/clips/${id}/`)).data;
  },
  async like(id: number) {
    return (await apiClient.post<Clip>(`/clips/${id}/like/`)).data;
  },
  async save(id: number) {
    return (await apiClient.post<Clip>(`/clips/${id}/save/`)).data;
  },
  async comments(id: number) {
    return (await apiClient.get<ClipComment[]>(`/clips/${id}/comment/`)).data;
  },
  async addComment(id: number, body: string) {
    return (await apiClient.post<ClipComment>(`/clips/${id}/comment/`, { body })).data;
  },
  async share(id: number) {
    return (await apiClient.post<{ sharesCount: number }>(`/clips/${id}/share/`)).data;
  },
  async report(id: number, reason = "") {
    return (await apiClient.post<{ detail: string }>(`/clips/${id}/report/`, { reason })).data;
  },
  async remove(id: number) {
    await apiClient.delete(`/clips/${id}/`);
  },
  async userClips(userId: string) {
    return (await apiClient.get<Clip[]>(`/users/${userId}/clips/`)).data;
  },
  async upload(form: FormData, onProgress?: (pct: number) => void) {
    return (await apiClient.post<Clip>("/clips/", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100)); },
    })).data;
  },
};
