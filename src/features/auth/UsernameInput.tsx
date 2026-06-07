import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAvailabilityChange?: (ok: boolean) => void;
  label?: string;
}

/** Lowercased handle input with live availability + rule checking. */
export function UsernameInput({ value, onChange, onAvailabilityChange, label = "Username" }: Props) {
  const debounced = useDebounce(value, 400);
  const [state, setState] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const v = debounced.trim().toLowerCase();
    if (!v) { setState("idle"); setMsg(""); onAvailabilityChange?.(false); return; }
    let cancelled = false;
    setState("checking");
    authService.checkUsername(v)
      .then((res) => {
        if (cancelled) return;
        if (res.available) { setState("ok"); setMsg("Available"); onAvailabilityChange?.(true); }
        else { setState("bad"); setMsg(res.error || "Not available"); onAvailabilityChange?.(false); }
      })
      .catch(() => { if (!cancelled) { setState("idle"); setMsg(""); onAvailabilityChange?.(false); } });
    return () => { cancelled = true; };
  }, [debounced, onAvailabilityChange]);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">@</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
          placeholder="yourhandle"
          className="h-11 w-full rounded-xl border border-sand-border bg-sand-card pl-7 pr-9 text-sm focus-visible:focus-ring"
          maxLength={30}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {state === "checking" && <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />}
          {state === "ok" && <Check className="h-4 w-4 text-green-600" />}
          {state === "bad" && <X className="h-4 w-4 text-red-500" />}
        </span>
      </div>
      {msg && <p className={`mt-1 text-xs ${state === "ok" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
      <p className="mt-1 text-xs text-ink-muted">Letters, numbers, dots and underscores. This is your public @handle.</p>
    </div>
  );
}
