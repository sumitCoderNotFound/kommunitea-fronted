import { apiClient } from "./apiClient";

export interface ProfileBuildResult { bio: string; headline?: string; aiPowered: boolean; note?: string; }
export interface CVReviewResult {
  summary?: string; strengths: string[]; improvements: string[]; atsTips: string[];
  aiPowered: boolean; note?: string; error?: string;
}
export interface JobMatch {
  id: number; score: number; reason: string;
  job?: { id: number; title: string; company: string; location: string; applyUrl: string };
}
export interface JobMatchResult { matches: JobMatch[]; aiPowered: boolean; note?: string; }

export const aiService = {
  async buildProfile(overrides?: Record<string, unknown>) {
    const { data } = await apiClient.post<ProfileBuildResult>("/ai/profile-builder/", overrides ?? {});
    return data;
  },
  async reviewCV(cvText: string) {
    const { data } = await apiClient.post<CVReviewResult>("/ai/cv-review/", { cvText });
    return data;
  },
  async matchJobs() {
    const { data } = await apiClient.post<JobMatchResult>("/ai/job-match/", {});
    return data;
  },
};
