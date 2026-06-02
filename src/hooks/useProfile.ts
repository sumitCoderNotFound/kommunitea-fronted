import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/profileService";

export function useProfile(id?: string) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => profileService.getById(id!),
    enabled: !!id,
  });
}
