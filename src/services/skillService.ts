import { apiClient } from "./apiClient";

export const skillService = {
  /** Suggest skills from the backend ESCO proxy (with curated fallback). */
  async suggest(q: string): Promise<string[]> {
    const { data } = await apiClient.get<{ results: string[] }>("/skills/suggest/", { params: { q } });
    return data.results ?? [];
  },
};
