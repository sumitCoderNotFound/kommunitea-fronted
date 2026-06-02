import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/utils/cn";

interface StreakBadgeProps {
  streak: number;
  longest?: number;
  size?: "sm" | "lg";
  className?: string;
}

/** Snapchat-style fire streak. The flame flickers; bigger streaks burn hotter. */
export function StreakBadge({ streak, longest, size = "lg", className }: StreakBadgeProps) {
  const big = size === "lg";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ rotate: [0, -4, 4, -2, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-400/40 blur-md"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <Flame
          className={cn("relative fill-orange-400 text-orange-500", big ? "h-10 w-10" : "h-6 w-6")}
          strokeWidth={1.5}
        />
      </motion.div>
      <div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={streak}
            initial={{ scale: 1.4, color: "#F97316" }}
            animate={{ scale: 1, color: "#1E1E2D" }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={cn("font-display font-bold", big ? "text-3xl" : "text-xl")}
          >
            {streak}
          </motion.span>
          <span className={cn("font-semibold text-ink-soft", big ? "text-base" : "text-sm")}>
            day{streak === 1 ? "" : "s"} streak
          </span>
        </div>
        {longest !== undefined && big && (
          <p className="text-xs text-ink-muted">Longest: {longest} days · keep it going! 🔥</p>
        )}
      </div>
    </div>
  );
}
