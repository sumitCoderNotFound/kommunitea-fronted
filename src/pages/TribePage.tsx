import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Users, Sparkles, Compass, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CommunityCard } from "@/features/tribe/CommunityCard";
import { communityService } from "@/services/communityService";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/constants";
import { listStagger, popIn } from "@/utils/motion";
import type { Community } from "@/types";

export function TribePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const [q, setQ] = useState("");
  const term = useDebounce(q.trim(), 350);
  const samePlace = me?.university || me?.city || "";

  const { data: samePlaceData } = useQuery({
    queryKey: ["tribe-sameplace", samePlace],
    queryFn: () => profileService.search(samePlace),
    enabled: !!samePlace,
  });
  const samePlacePeople = (samePlaceData?.results ?? []).filter((p) => p.id !== me?.id);

  const { data: mine, isLoading: mineLoading } = useQuery({
    queryKey: ["communities", "mine"],
    queryFn: () => communityService.list({ mine: true }),
  });
  const { data: suggestions = [], isLoading: sugLoading } = useQuery({
    queryKey: ["communities", "suggestions"],
    queryFn: communityService.suggestions,
  });
  const { data: peopleData } = useQuery({
    queryKey: ["tribe-people"],
    queryFn: () => profileService.search(""),
  });
  const people = peopleData?.results ?? [];
  // Search across communities only when the user types
  const { data: searchResults, isFetching: searching } = useQuery({
    queryKey: ["communities", "search", term],
    queryFn: () => communityService.list({ search: term }),
    enabled: term.length > 1,
  });
  // Search people in parallel so the search shows both communities and members.
  const { data: peopleSearch, isFetching: searchingPeople } = useQuery({
    queryKey: ["people", "search", term],
    queryFn: () => profileService.search(term),
    enabled: term.length > 1,
  });
  const peopleResults = (peopleSearch?.results ?? []).filter((p) => p.id !== me?.id);

  const join = useMutation({
    mutationFn: (c: Community) => (c.isMember ? communityService.leave(c.id) : communityService.join(c.id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: (e) => toast.error("Couldn't update membership: " + (e as Error).message),
  });

  const myCommunities = mine?.results ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Tribe</h1>
        <p className="text-sm text-ink-muted">Find your people — communities, members and conversations.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search communities, people, skills..."
          className="h-12 w-full rounded-2xl border border-sand-border bg-sand-card pl-11 pr-4 text-sm focus-visible:focus-ring"
        />
      </div>

      {/* Search results */}
      {term.length > 1 ? (
        <div className="space-y-6">
          <section>
            <SectionTitle icon={Compass}>Communities</SectionTitle>
            {searching ? <Loader /> : (searchResults?.results.length ?? 0) === 0 ? (
              <EmptyState icon={Compass} title="No communities found" description="Try a different search term." />
            ) : (
              <CardGrid>
                {searchResults!.results.map((c) => (
                  <CommunityCard key={c.id} community={c} onToggleJoin={(x) => join.mutate(x)} joining={join.isPending} />
                ))}
              </CardGrid>
            )}
          </section>

          <section>
            <SectionTitle icon={Users}>People</SectionTitle>
            {searchingPeople ? <Loader /> : peopleResults.length === 0 ? (
              <EmptyState icon={Users} title="No people found" description="Try a name, university or skill." />
            ) : (
              <motion.div variants={listStagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {peopleResults.slice(0, 9).map((p) => (
                  <motion.div key={p.id} variants={popIn}>
                    <Card onClick={() => navigate(ROUTES.profile(p.id))}
                      className="flex cursor-pointer items-center gap-3 p-4 hover:shadow-soft">
                      <Avatar name={p.fullName} src={p.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.fullName}</p>
                        <p className="truncate text-xs text-ink-muted">{p.university || p.city || p.userType}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>
      ) : (
        <>
          {/* Your communities */}
          <section>
            <SectionTitle icon={Users}>Your communities</SectionTitle>
            {mineLoading ? <Loader /> : myCommunities.length === 0 ? (
              <EmptyState icon={Users} title="You haven't joined any yet"
                description="Join a community below to see its feed, members, events and chat." />
            ) : (
              <CardGrid>
                {myCommunities.map((c) => (
                  <CommunityCard key={c.id} community={c} onToggleJoin={(x) => join.mutate(x)} joining={join.isPending} />
                ))}
              </CardGrid>
            )}
          </section>

          {/* Trending / suggested */}
          <section>
            <SectionTitle icon={Sparkles}>Suggested for you</SectionTitle>
            {sugLoading ? <Loader /> : suggestions.length === 0 ? (
              <EmptyState icon={Sparkles} title="Nothing to suggest yet"
                description="As more communities are created they'll show up here." />
            ) : (
              <CardGrid>
                {suggestions.map((c) => (
                  <CommunityCard key={c.id} community={c} onToggleJoin={(x) => join.mutate(x)} joining={join.isPending} />
                ))}
              </CardGrid>
            )}
          </section>

          {/* People to follow */}
          {people.length > 0 && (
            <section>
              <SectionTitle icon={Users}>People to follow</SectionTitle>
              <motion.div variants={listStagger} initial="hidden" animate="show"
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {people.slice(0, 6).map((p) => (
                  <motion.div key={p.id} variants={popIn}>
                    <Card onClick={() => navigate(ROUTES.profile(p.id))}
                      className="flex cursor-pointer items-center gap-3 p-4 hover:shadow-soft">
                      <Avatar name={p.fullName} src={p.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.fullName}</p>
                        <p className="truncate text-xs text-ink-muted">{p.university || p.city || p.userType}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* People from your university / city */}
          {samePlacePeople.length > 0 && (
            <section>
              <SectionTitle icon={GraduationCap}>People from {me?.university || me?.city}</SectionTitle>
              <motion.div variants={listStagger} initial="hidden" animate="show"
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {samePlacePeople.slice(0, 6).map((p) => (
                  <motion.div key={p.id} variants={popIn}>
                    <Card onClick={() => navigate(ROUTES.profile(p.id))}
                      className="flex cursor-pointer items-center gap-3 p-4 hover:shadow-soft">
                      <Avatar name={p.fullName} src={p.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.fullName}</p>
                        <p className="truncate text-xs text-ink-muted">{p.course || p.university || p.city}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
      <Icon className="h-4 w-4 text-coral" /> {children}
    </h2>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={listStagger} initial="hidden" animate="show"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.isArray(children)
        ? children.map((child, i) => <motion.div key={i} variants={popIn}>{child}</motion.div>)
        : <motion.div variants={popIn}>{children}</motion.div>}
    </motion.div>
  );
}
