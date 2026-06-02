import { cn } from "@/utils/cn";
import { BadgeCheck } from "lucide-react";

const styles = {
  student: "bg-sky-soft text-sky",
  alumni: "bg-amber-100 text-amber-700",
  recruiter: "bg-emerald-100 text-emerald-700",
};

export function VerifiedBadge({ type }: { type: keyof typeof styles }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", styles[type])}>
      <BadgeCheck className="h-3 w-3" /> {type}
    </span>
  );
}
