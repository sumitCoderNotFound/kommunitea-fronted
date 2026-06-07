import { apiClient } from "./apiClient";
import type { Paginated, CVAnalysis } from "@/types";

export const cvService = {
  // Past CV reports for the current user
  async list() {
    const { data } = await apiClient.get<Paginated<CVAnalysis>>("/cv/");
    return data;
  },
  // Upload a CV file (PDF/DOCX) + optional job description → runs ATS scoring
  async analyze(file: File, jobDescription?: string) {
    const form = new FormData();
    form.append("file", file);
    if (jobDescription) form.append("jobDescription", jobDescription);
    const { data } = await apiClient.post<CVAnalysis>("/cv/analyze/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
