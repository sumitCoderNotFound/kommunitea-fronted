import { motion } from "framer-motion";
import type { ActivityMap } from "@/hooks/useStreak";
import { cn } from "@/utils/cn";

interface ActivityGridProps {
  activity: ActivityMap;
  weeks?: number;       // how many weeks back to show
  showMonths?: boolean;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function level(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

// green contribution scale (recognisable GitHub feel)
const LEVELS = [
  "bg-sand-border",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-500",
  "bg-emerald-700",
];

export function ActivityGrid({ activity, weeks = 26, showMonths = true }: ActivityGridProps) {
  // Build columns of weeks, each with 7 days (Sun..Sat), ending today
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay())); // end of current week (Sat)

  const days: { key: string; date: Date; count: number }[] = [];
  const total = weeks * 7;
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, date: d, count: activity[key] || 0 });
  }

  // group into columns of 7
  const cols: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));

  // month labels: show when the month changes at the top of a column
  const monthLabels = cols.map((col) => {
    const first = col[0]?.date;
    return first && first.getDate() <= 7 ? MONTHS[first.getMonth()] : "";
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {showMonths && (
          <div className="mb-1 flex gap-[3px] pl-7 text-[10px] text-ink-muted">
            {monthLabels.map((m, i) => (
              <span key={i} className="w-[13px] shrink-0">{m}</span>
            ))}
          </div>
        )}
        <div className="flex gap-[3px]">
          {/* day-of-week labels */}
          <div className="mr-1 flex flex-col gap-[3px] pt-[0px] text-[9px] text-ink-muted">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <span key={i} className="flex h-[13px] items-center">{d}</span>
            ))}
          </div>
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {col.map((day, di) => (
                <motion.div
                  key={day.key}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (ci * 7 + di) * 0.001, type: "spring", stiffness: 500, damping: 30 }}
                  whileHover={{ scale: 1.4, zIndex: 10 }}
                  title={`${day.count} on ${day.key}`}
                  className={cn("h-[13px] w-[13px] rounded-[3px]", LEVELS[level(day.count)])}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-ink-muted">
          Less
          {LEVELS.map((l, i) => <span key={i} className={cn("h-[11px] w-[11px] rounded-[3px]", l)} />)}
          More
        </div>
      </div>
    </div>
  );
}
