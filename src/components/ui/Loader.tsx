import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function Loader({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-ink-muted", className)}>
      <Loader2 className="h-7 w-7 animate-spin text-coral" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
