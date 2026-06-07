import { apiClient } from "./apiClient";

export type SharePlatform = "instagram" | "linkedin" | "whatsapp" | "website" | "text";
export type ShareDestination =
  | "post" | "story" | "community_resource" | "message" | "plan" | "job_application" | "saved";

export interface SharePreview {
  sourcePlatform: SharePlatform;
  sourceUrl: string;
  sourceText: string;
  sourceImage: string;
  title: string;
  description: string;
  thumbnail: string;
  suggestedDestinations: ShareDestination[];
  attribution: string;
}

export interface ExternalShare {
  id: number;
  sourcePlatform: SharePlatform;
  sourceUrl: string;
  sourceText: string;
  title: string;
  description: string;
  thumbnail: string;
  destinationType: ShareDestination | "";
  destinationId: string;
  status: string;
  createdAt: string;
}

export interface CreateSharePayload {
  sourcePlatform: SharePlatform;
  sourceUrl?: string;
  sourceText?: string;
  sourceImage?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  destinationType: ShareDestination;
  communityId?: string;
}

export const externalShareService = {
  async preview(input: { url?: string; text?: string; image?: string }) {
    const { data } = await apiClient.post<SharePreview>("/external-shares/preview/", {
      sourceUrl: input.url ?? "", sourceText: input.text ?? "", sourceImage: input.image ?? "",
    });
    return data;
  },
  async create(payload: CreateSharePayload) {
    const { data } = await apiClient.post<ExternalShare>("/external-shares/", payload);
    return data;
  },
  async list() {
    const { data } = await apiClient.get<{ results: ExternalShare[] } | ExternalShare[]>("/external-shares/");
    return Array.isArray(data) ? data : data.results ?? [];
  },
  async remove(id: number | string) {
    await apiClient.delete(`/external-shares/${id}/`);
  },
};
