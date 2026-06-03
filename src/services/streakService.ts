import { apiClient } from "./apiClient";

export interface StreakData { currentStreak: number; longestStreak: number; lastVisit: string | null; }

export const streakService = {
  async get(): Promise<StreakData> {
    const { data } = await apiClient.get<StreakData>("/streak/");
    return data;
  },
  /** Record today's visit (idempotent server-side) and return updated streak. */
  async ping(): Promise<StreakData> {
    const { data } = await apiClient.post<StreakData>("/streak/");
    return data;
  },
};
