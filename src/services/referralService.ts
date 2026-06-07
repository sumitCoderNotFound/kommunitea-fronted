import { apiClient } from "./apiClient";
import type { Paginated, ReferralRequest } from "@/types";

export const referralService = {
  async list() {
    const { data } = await apiClient.get<Paginated<ReferralRequest>>("/referrals/");
    return data;
  },
  async create(payload: Partial<ReferralRequest>) {
    const { data } = await apiClient.post<ReferralRequest>("/referrals/", payload);
    return data;
  },
  async update(id: string, payload: Partial<ReferralRequest>) {
    const { data } = await apiClient.patch<ReferralRequest>(`/referrals/${id}/`, payload);
    return data;
  },
  async remove(id: string) {
    await apiClient.delete(`/referrals/${id}/`);
  },
};
