import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface ComboboxProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  /** when the chosen option is "Other", show a free-text input */
  allowOther?: boolean;
}

/** Searchable single-select. If "Other" is picked and allowOther, user types their own. */
export function Combobox({ label, value, onChange, options, placeholder = "Select...", error, allowOther }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isOther, setIsOther] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  if (isOther) {
    return (
      <div>
        {label && <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>}
        <input autoFocus value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
          className="w-full rounded-xl border border-sand-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coral" />
        <button type="button" onClick={() => { setIsOther(false); onChange(""); }}
          className="mt-1 text-xs text-coral hover:underline">← back to list</button>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div ref={ref}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>}
      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)}
          className={cn("flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm outline-none",
            error ? "border-red-400" : "border-sand-border focus:border-coral")}>
          <span className={value ? "text-ink" : "text-ink-muted"}>{value || placeholder}</span>
          <ChevronDown className="h-4 w-4 text-ink-muted" />
        </button>
        {open && (
          <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-sand-border bg-white py-1 shadow-lift">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..."
              className="mb-1 w-[calc(100%-1rem)] mx-2 rounded-lg border border-sand-border px-2.5 py-1.5 text-sm outline-none focus:border-coral" />
            {filtered.map((o) => (
              <button key={o} type="button"
                onClick={() => {
                  if (allowOther && o === "Other") { setIsOther(true); onChange(""); }
                  else onChange(o);
                  setOpen(false); setQuery("");
                }}
                className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm hover:bg-sand">
                {o}
                {value === o && <Check className="h-4 w-4 text-coral" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3.5 py-2 text-sm text-ink-muted">No matches</p>}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
