import { useEffect, useState } from "react";
import { streakService } from "@/services/streakService";
import { useAuthStore } from "@/store/authStore";

/**
 * Per-user streak. The authoritative current/longest streak comes from the
 * backend (permanent, syncs across devices, never bleeds between accounts).
 * The day-by-day activity grid is kept locally for the visual, keyed per-user.
 */
export type ActivityMap = Record<string, number>; // "YYYY-MM-DD" -> count

function dayKey(d: Date) { return d.toISOString().slice(0, 10); }
function storeKey(userId?: string) { return `ujt_activity_${userId ?? "anon"}`; }

function load(userId?: string): ActivityMap {
  try { return JSON.parse(localStorage.getItem(storeKey(userId)) || "{}"); }
  catch { return {}; }
}

export function useStreak() {
  const userId = useAuthStore((s) => s.user?.id ? String(s.user.id) : undefined);
  const [activity, setActivity] = useState<ActivityMap>(() => load(userId));
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (!userId) return;
    // 1) authoritative streak from backend (records today's visit)
    streakService.ping()
      .then((d) => { setCurrentStreak(d.currentStreak); setLongestStreak(d.longestStreak); })
      .catch(() => {});
    // 2) decorative activity grid, per-user
    const map = load(userId);
    const today = dayKey(new Date());
    map[today] = (map[today] || 0) + 1;
    localStorage.setItem(storeKey(userId), JSON.stringify(map));
    setActivity(map);
  }, [userId]);

  const bump = () => {
    const map = load(userId);
    const today = dayKey(new Date());
    map[today] = (map[today] || 0) + 1;
    localStorage.setItem(storeKey(userId), JSON.stringify(map));
    setActivity(map);
  };

  return { activity, currentStreak, longestStreak, bump };
}
