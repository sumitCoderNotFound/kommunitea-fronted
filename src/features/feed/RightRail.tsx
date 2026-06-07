import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, TrendingUp, Bell, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ActivityGrid } from "@/features/profile/ActivityGrid";
import { StreakBadge } from "@/features/profile/StreakBadge";
import { useStreak } from "@/hooks/useStreak";
import { profileService } from "@/services/profileService";
import { schedulerService } from "@/services/schedulerService";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";
import { springy } from "@/utils/motion";

export function RightRail() {
  const { activity, currentStreak, longestStreak } = useStreak();
  const me = useAuthStore((s) => s.user);
  const { data } = useQuery({ queryKey: ["suggested-members"], queryFn: () => profileService.list() });
  const suggestions = (data?.results ?? [])
    .filter((u) => String(u.id) !== String(me?.id) && !u.isFollowing && !u.hasRequested)
    .slice(0, 5);
  // Real community events from the scheduler's opportunities feed.
  const { data: events = [] } = useQuery({
    queryKey: ["rail-events"],
    queryFn: () => schedulerService.opportunities("event"),
  });

  return (
    <aside className="hidden w-[300px] shrink-0 space-y-4 xl:block">
      {/* Friend / member suggestions (SlothUI "Friend Suggestions") */}
      {suggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={springy}>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold">Member Suggestions</h3>
              <Link to={ROUTES.feed} className="text-xs font-medium text-coral hover:underline">See all</Link>
            </div>
            <div className="space-y-3">
              {suggestions.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Link to={ROUTES.profile(u.id)}><Avatar name={u.fullName} src={u.avatarUrl} size="sm" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to={ROUTES.profile(u.id)} className="block truncate text-sm font-medium hover:underline">{u.fullName}</Link>
                    <p className="truncate text-xs text-ink-muted">{u.university || u.city || "Member"}</p>
                  </div>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Link to={ROUTES.profile(u.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-coral hover:bg-coral/10">
                      <UserPlus className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Profile Activity (SlothUI-style) — real follower count + your streak */}
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springy, delay: 0.06 }}>
        <Card className="p-5">
          <h3 className="mb-3 font-display font-semibold">Profile Activity</h3>
          <div className="rounded-2xl bg-sky-soft p-4">
            {suggestions.length > 0 && (
              <div className="mb-3 flex -space-x-2">
                {suggestions.slice(0, 6).map((u) => (
                  <Avatar key={u.id} name={u.fullName} src={u.avatarUrl} size="xs" className="ring-2 ring-white" />
                ))}
              </div>
            )}
            <p className="font-display text-2xl font-bold text-ink">
              {me?.followersCount ?? 0} <span className="text-base font-semibold text-ink-soft">Followers</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" /> {me?.followingCount ?? 0} following
            </p>
            <div className="mt-3">
              <StreakBadge streak={currentStreak} longest={longestStreak} size="sm" />
            </div>
            <div className="mt-3">
              <ActivityGrid activity={activity} weeks={14} showMonths={false} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Upcoming Events — real community events */}
      {events.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springy, delay: 0.12 }}>
          <Card className="p-5">
            <h3 className="mb-3 font-display font-semibold">Upcoming Events</h3>
            <div className="space-y-3">
              {events.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand">
                    <CalendarDays className="h-4 w-4 text-coral" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-ink-muted">
                      {[e.org || e.location, e.deadline ? new Date(e.deadline).toLocaleDateString() : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Bell className="h-4 w-4 text-ink-muted" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </aside>
  );
}
