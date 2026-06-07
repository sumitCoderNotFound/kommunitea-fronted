import { apiClient } from "./apiClient";
import type { Paginated, InterviewPrep } from "@/types";

export const interviewPrepService = {
  async list() {
    const { data } = await apiClient.get<Paginated<InterviewPrep>>("/interview-prep/");
    return data;
  },
  async create(payload: Partial<InterviewPrep>) {
    const { data } = await apiClient.post<InterviewPrep>("/interview-prep/", payload);
    return data;
  },
  async update(id: string, payload: Partial<InterviewPrep>) {
    const { data } = await apiClient.patch<InterviewPrep>(`/interview-prep/${id}/`, payload);
    return data;
  },
  async completeChecklistItem(id: string, index: number) {
    const { data } = await apiClient.post<InterviewPrep>(`/interview-prep/${id}/complete-checklist-item/`, { index });
    return data;
  },
  async remove(id: string) {
    await apiClient.delete(`/interview-prep/${id}/`);
  },
};
