import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

/* A lightweight, fully-styled date + time picker that matches Kommunitea.
   value/onChange use a datetime-local string: "YYYY-MM-DDTHH:mm" (or ""). */
interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function toLocalString(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimePicker({ value, onChange, placeholder = "Set date & time" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value) : null;
  const [month, setMonth] = useState(() => selected ?? new Date());

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const year = month.getFullYear(), mon = month.getMonth();
  const firstDay = (new Date(year, mon, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells = useMemo(
    () => [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, mon, i + 1))],
    [firstDay, daysInMonth, year, mon],
  );
  const todayStr = new Date().toDateString();

  const pickDay = (d: Date) => {
    const base = selected ?? new Date();
    const next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), base.getHours() || 9, base.getMinutes() || 0);
    onChange(toLocalString(next));
  };
  const setTime = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    const base = selected ?? new Date();
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
    onChange(toLocalString(next));
  };

  const label = selected
    ? selected.toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : placeholder;

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-lg border border-sand-border bg-sand px-3 py-1.5 text-xs outline-none transition-colors hover:border-coral/50 ${selected ? "text-ink" : "text-ink-muted"}`}>
        <CalIcon className="h-3.5 w-3.5" /> {label}
        {selected && <X className="h-3 w-3 text-ink-muted hover:text-rose-500" onClick={(e) => { e.stopPropagation(); onChange(""); }} />}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border border-sand-border bg-sand-card p-3 shadow-lift">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setMonth(new Date(year, mon - 1, 1))} className="rounded-md p-1 text-ink-muted hover:bg-ink/5"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-semibold text-ink">{month.toLocaleDateString([], { month: "long", year: "numeric" })}</span>
            <button type="button" onClick={() => setMonth(new Date(year, mon + 1, 1))} className="rounded-md p-1 text-ink-muted hover:bg-ink/5"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-ink-muted">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const isSel = selected && d.toDateString() === selected.toDateString();
              const isToday = d.toDateString() === todayStr;
              return (
                <button type="button" key={i} onClick={() => pickDay(d)}
                  className={`flex h-8 items-center justify-center rounded-lg text-xs transition-colors
                    ${isSel ? "bg-coral font-semibold text-white" : isToday ? "bg-coral/15 font-bold text-coral" : "text-ink-soft hover:bg-ink/5"}`}>
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-sand-border pt-3">
            <input type="time" value={selected ? `${pad(selected.getHours())}:${pad(selected.getMinutes())}` : "09:00"}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border border-sand-border bg-sand px-2 py-1 text-xs text-ink outline-none focus:border-coral" />
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="font-medium text-ink-muted hover:text-ink">Clear</button>
              <button type="button" onClick={() => setOpen(false)} className="font-medium text-coral hover:underline">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
