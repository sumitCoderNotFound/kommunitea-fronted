import { useUIStore } from "@/store/uiStore";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

const config = {
  success: { icon: CheckCircle2, color: "text-success" },
  error: { icon: XCircle, color: "text-red-500" },
  info: { icon: Info, color: "text-sky" },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useUIStore();
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const { icon: Icon, color } = config[t.type];
        return (
          <div key={t.id} className="flex items-start gap-3 rounded-xl border border-sand-border bg-white p-3.5 shadow-lift animate-fade-up">
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", color)} />
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="text-ink-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
