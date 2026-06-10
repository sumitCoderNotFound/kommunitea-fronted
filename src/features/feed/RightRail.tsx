import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, CalendarDays, Flame, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useStreak } from "@/hooks/useStreak";
import { useToast } from "@/hooks/useToast";
import { profileService } from "@/services/profileService";
import { communityService } from "@/services/communityService";
import { schedulerService } from "@/services/schedulerService";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";
import { springy } from "@/utils/motion";

export function RightRail() {
  const { currentStreak } = useStreak();
  const me = useAuthStore((s) => s.user);
  const toast = useToast();
  const qc = useQueryClient();

  const { data: members } = useQuery({ queryKey: ["suggested-members"], queryFn: () => profileService.list() });
  const suggestions = (members?.results ?? [])
    .filter((u) => String(u.id) !== String(me?.id) && !u.isFollowing && !u.hasRequested)
    .slice(0, 5);

  const { data: communities } = useQuery({ queryKey: ["suggested-communities"], queryFn: () => communityService.list() });
  const communitySuggestions = ((communities?.results ?? communities ?? []) as any[])
    .filter((c) => !c.isMember).slice(0, 3);

  const { data: events = [] } = useQuery({ queryKey: ["rail-events"], queryFn: () => schedulerService.opportunities("event") });

  const join = useMutation({
    mutationFn: (id: string) => communityService.join(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suggested-communities"] }); toast.success("Joined community"); },
    onError: (e) => toast.error("Couldn't join: " + (e as Error).message),
  });

  return (
    <aside className="hidden w-[320px] shrink-0 space-y-4 xl:block">
      {/* Mini profile */}
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={springy}>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.profile(String(me?.id ?? ""))}><Avatar name={me?.fullName ?? "You"} src={me?.avatarUrl} /></Link>
            <div className="min-w-0 flex-1">
              <Link to={ROUTES.profile(String(me?.id ?? ""))} className="block truncate font-display font-semibold hover:underline">{me?.fullName ?? "You"}</Link>
              {me?.username && <p className="truncate text-xs text-ink-muted">@{me.username}</p>}
            </div>
          </div>
          {typeof me?.profileCompletion === "number" && me.profileCompletion < 100 && (
            <Link to={ROUTES.profile(String(me?.id ?? ""))} className="mt-3 block">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>Profile {me.profileCompletion}% complete</span><span className="text-coral">Finish</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand-border">
                <div className="h-full rounded-full bg-coral" style={{ width: `${me.profileCompletion}%` }} />
              </div>
            </Link>
          )}
        </Card>
      </motion.div>

      {/* Member suggestions (max 5) */}
      {suggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springy, delay: 0.04 }}>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold">Member suggestions</h3>
              <Link to={ROUTES.tribe} className="text-xs font-medium text-coral hover:underline">See all</Link>
            </div>
            <div className="space-y-3">
              {suggestions.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Link to={ROUTES.profile(u.id)}><Avatar name={u.fullName} src={u.avatarUrl} size="sm" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to={ROUTES.profile(u.id)} className="block truncate text-sm font-medium hover:underline">{u.fullName}</Link>
                    <p className="truncate text-xs text-ink-muted">{u.university || u.city || "Member"}</p>
                  </div>
                  <Link to={ROUTES.profile(u.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-coral hover:bg-coral/10"><UserPlus className="h-4 w-4" /></Link>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Community suggestions (max 3) */}
      {communitySuggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springy, delay: 0.08 }}>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold">Communities to join</h3>
              <Link to={ROUTES.tribe} className="text-xs font-medium text-coral hover:underline">See all</Link>
            </div>
            <div className="space-y-3">
              {communitySuggestions.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand">
                    {c.imageUrl ? <img src={c.imageUrl} alt="" className="h-9 w-9 rounded-xl object-cover" /> : <Users className="h-4 w-4 text-coral" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={ROUTES.communityDetail(c.id)} className="block truncate text-sm font-medium hover:underline">{c.name}</Link>
                    <p className="truncate text-xs text-ink-muted">{c.membersCount} members</p>
                  </div>
                  <Button size="sm" variant="ghost" isLoading={join.isPending && join.variables === c.id} onClick={() => join.mutate(c.id)}>Join</Button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Small streak card */}
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springy, delay: 0.12 }}>
        <Link to={ROUTES.plan}>
          <Card className="flex items-center gap-3 p-4 transition-colors hover:border-coral">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10"><Flame className="h-5 w-5 text-coral" /></div>
            <div className="flex-1">
              <p className="font-display font-semibold">{currentStreak} day streak</p>
              <p className="text-xs text-ink-muted">See details in Plan</p>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Upcoming events (max 2) */}
      {events.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springy, delay: 0.16 }}>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold">Upcoming events</h3>
              <Link to={ROUTES.plan} className="text-xs font-medium text-coral hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {events.slice(0, 2).map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand"><CalendarDays className="h-4 w-4 text-coral" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-ink-muted">{[e.org || e.location, e.deadline ? new Date(e.deadline).toLocaleDateString() : null].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </aside>
  );
}
