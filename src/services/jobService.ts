import { apiClient } from "./apiClient";
import type { Paginated, Job, SponsorCompany } from "@/types";

export interface JobFilters {
  search?: string;
  jobType?: string;
  visaSponsorship?: boolean;
  location?: string;
  country?: string;
  experienceLevel?: string;
  isActive?: boolean;
}

export const jobService = {
  async list(filters: JobFilters = {}) {
    // Strip empty values so we don't send blank query params.
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null),
    );
    const { data } = await apiClient.get<Paginated<Job>>("/jobs/", { params });
    return data;
  },
  async get(id: string) {
    const { data } = await apiClient.get<Job>(`/jobs/${id}/`);
    return data;
  },
  // Save → creates/updates a JobApplication with status "saved"
  async save(id: string) {
    const { data } = await apiClient.post(`/jobs/${id}/save/`);
    return data;
  },
  // Apply → creates/updates a JobApplication with status "applied", returns applyUrl
  async apply(id: string) {
    const { data } = await apiClient.post<{ applyUrl?: string }>(`/jobs/${id}/apply/`);
    return data;
  },
  async sponsorCompanies(filters: { country?: string; industry?: string; search?: string } = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null),
    );
    const { data } = await apiClient.get<Paginated<SponsorCompany>>("/career-tools/sponsor-companies/", { params });
    return data;
  },
};
