import type { ApplicationStatus } from "@/types";
import { cn } from "@/utils/cn";

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; chip: string }> = {
  saved:     { label: "Saved",             chip: "bg-slate-500/10 text-slate-500" },
  applied:   { label: "Applied",           chip: "bg-sky-500/10 text-sky-500" },
  response:  { label: "Response received", chip: "bg-violet-500/10 text-violet-500" },
  interview: { label: "Interview",         chip: "bg-amber-500/10 text-amber-600" },
  rejected:  { label: "Rejected",          chip: "bg-rose-500/10 text-rose-500" },
  offer:     { label: "Offer",             chip: "bg-emerald-500/10 text-emerald-600" },
  follow_up: { label: "Follow-up needed",  chip: "bg-coral/10 text-coral" },
};

export const APPLICATION_STATUS_OPTIONS = (Object.keys(APPLICATION_STATUS) as ApplicationStatus[])
  .map((value) => ({ value, label: APPLICATION_STATUS[value].label }));

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = APPLICATION_STATUS[status] ?? APPLICATION_STATUS.saved;
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", meta.chip)}>
      {meta.label}
    </span>
  );
}
