import { useEffect, useState } from "react";

/**
 * Real, local streak tracking. Every day the user opens the app we record
 * a visit in localStorage, then compute current streak, longest streak and a
 * day-by-day activity map (for the GitHub-style grid). No backend needed,
 * and it reflects genuine usage rather than fake numbers.
 *
 * When a notifications/activity backend exists, swap `activity` for server data.
 */
const KEY = "ujt_activity_v1";
export type ActivityMap = Record<string, number>; // "YYYY-MM-DD" -> count

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function load(): ActivityMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function computeStreak(map: ActivityMap) {
  let current = 0;
  const cursor = new Date();
  // Count back from today while each day has activity
  // (allow today to be empty without breaking the streak yet)
  if (!map[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (map[dayKey(cursor)]) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  // Longest streak across all recorded days
  const days = Object.keys(map).filter((k) => map[k] > 0).sort();
  let longest = 0, run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const d = new Date(k);
    if (prev && (d.getTime() - prev.getTime()) === 86400000) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}

export function useStreak() {
  const [activity, setActivity] = useState<ActivityMap>(load);

  useEffect(() => {
    const map = load();
    const today = dayKey(new Date());
    map[today] = (map[today] || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(map));
    setActivity(map);
  }, []);

  // Let other actions (e.g. posting) bump today's activity
  const bump = () => {
    const map = load();
    const today = dayKey(new Date());
    map[today] = (map[today] || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(map));
    setActivity(map);
  };

  const { current, longest } = computeStreak(activity);
  return { activity, currentStreak: current, longestStreak: longest, bump };
}
