import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/utils/cn";

interface MultiComboboxProps {
  label?: string;
  values: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  /** async loader for suggestions (e.g. ESCO skills). Receives query, returns options. */
  loadOptions?: (q: string) => Promise<string[]>;
  allowCustom?: boolean; // allow adding a typed value not in the list
}

/** Multi-select chips with search. Supports static options or an async loader. */
export function MultiCombobox({ label, values, onChange, options, placeholder = "Search and add...", error, loadOptions, allowCustom }: MultiComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [asyncOpts, setAsyncOpts] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!loadOptions) return;
    const t = setTimeout(async () => {
      try { setAsyncOpts(await loadOptions(query)); } catch { setAsyncOpts([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [query, loadOptions]);

  const base = loadOptions ? asyncOpts : options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  const available = base.filter((o) => !values.includes(o));

  const add = (v: string) => { if (v && !values.includes(v)) onChange([...values, v]); setQuery(""); };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div ref={ref}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>}
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-medium text-coral">
              {v}
              <button type="button" onClick={() => remove(v)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input value={query} onFocus={() => setOpen(true)} onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={(e) => { if (e.key === "Enter" && allowCustom && query.trim()) { e.preventDefault(); add(query.trim()); } }}
          placeholder={placeholder}
          className={cn("w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none",
            error ? "border-red-400" : "border-sand-border focus:border-coral")} />
        {open && (available.length > 0 || (allowCustom && query.trim())) && (
          <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-sand-border bg-white py-1 shadow-lift">
            {allowCustom && query.trim() && !available.includes(query.trim()) && (
              <button type="button" onClick={() => add(query.trim())}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-coral hover:bg-sand">
                <Plus className="h-4 w-4" /> Add "{query.trim()}"
              </button>
            )}
            {available.map((o) => (
              <button key={o} type="button" onClick={() => add(o)}
                className="block w-full px-3.5 py-2 text-left text-sm hover:bg-sand">{o}</button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
