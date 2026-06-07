import { apiClient } from "./apiClient";
import type { Project } from "@/types";

export const projectService = {
  // A user's showcase projects (defaults to mine when no id given).
  async byUser(userId: string) {
    const { data } = await apiClient.get<Project[]>("/projects/", { params: { user: userId } });
    return data;
  },
};
