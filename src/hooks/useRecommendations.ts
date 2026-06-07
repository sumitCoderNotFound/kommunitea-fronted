import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { communityService } from "@/services/communityService";
import { profileService } from "@/services/profileService";
import { jobService } from "@/services/jobService";
import { schedulerService } from "@/services/schedulerService";
import { useAuthStore } from "@/store/authStore";
import {
  rankCommunities, rankPeople, rankJobs, planActions, getHidden, hideRec, type RecType,
} from "@/services/recommendationService";

export function useRecommendations() {
  const user = useAuthStore((s) => s.user);
  const [version, setVersion] = useState(0); // bump to re-apply hidden
  const [boostUni, setBoostUni] = useState<string | undefined>();
  const [boostCat, setBoostCat] = useState<string | undefined>();

  const communitiesQ = useQuery({ queryKey: ["rec-communities"], queryFn: communityService.suggestions });
  const peopleQ = useQuery({ queryKey: ["rec-people"], queryFn: () => profileService.list() });
  const jobsQ = useQuery({ queryKey: ["rec-jobs"], queryFn: () => jobService.list({ isActive: true }) });
  const appsQ = useQuery({ queryKey: ["applications"], queryFn: schedulerService.applications });

  const hidden = useMemo(() => getHidden(), [version]);

  const communities = useMemo(
    () => rankCommunities(communitiesQ.data ?? [], user, hidden.communities, boostCat).slice(0, 4),
    [communitiesQ.data, user, hidden, boostCat],
  );
  const people = useMemo(
    () => rankPeople(peopleQ.data?.results ?? [], user, hidden.people, boostUni).slice(0, 4),
    [peopleQ.data, user, hidden, boostUni],
  );
  const jobs = useMemo(
    () => rankJobs(jobsQ.data?.results ?? [], appsQ.data ?? [], user, hidden.jobs).slice(0, 4),
    [jobsQ.data, appsQ.data, user, hidden],
  );
  const actions = useMemo(() => planActions(user, appsQ.data ?? []), [user, appsQ.data]);

  const hide = useCallback((type: RecType, id: string) => {
    hideRec(type, id);
    setVersion((v) => v + 1);
  }, []);

  return {
    communities, people, jobs, actions,
    hide,
    boostPeopleByUniversity: setBoostUni,
    boostCommunitiesByCategory: setBoostCat,
    isLoading: communitiesQ.isLoading || peopleQ.isLoading || jobsQ.isLoading,
  };
}
