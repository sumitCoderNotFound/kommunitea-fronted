import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Flame, Target, AlertTriangle, Lightbulb, Plus, Check, Clock,
  CalendarClock, Briefcase, Sparkles, MapPin, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import {
  schedulerService, suggestCategory, CATEGORY_META,
  type Task, type TaskCategory,
} from "@/services/schedulerService";

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as TaskCategory[];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
function timeLabel(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
const FOCUS_ICON: Record<string, typeof Flame> = {
  deadline: Flame, interview: Target, overdue: AlertTriangle, recommend: Lightbulb,
};

export function SchedulerPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "today" | "week" | "overdue">("all");
  const [activeCat, setActiveCat] = useState<TaskCategory | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["sched-tasks"], queryFn: schedulerService.tasks });
  const { data: goals = [] } = useQuery({ queryKey: ["sched-goals"], queryFn: schedulerService.goals });
  const { data: overview } = useQuery({ queryKey: ["sched-overview"], queryFn: schedulerService.overview });
  const { data: opportunities = [] } = useQuery({ queryKey: ["sched-opps", "opportunity"], queryFn: () => schedulerService.opportunities("opportunity") });
  const { data: events = [] } = useQuery({ queryKey: ["sched-opps", "event"], queryFn: () => schedulerService.opportunities("event") });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sched-tasks"] });
    qc.invalidateQueries({ queryKey: ["sched-overview"] });
  };

  const createTask = useMutation({
    mutationFn: (p: Partial<Task>) => schedulerService.createTask(p),
    onSuccess: () => { invalidate(); toast.success("Task added"); },
  });
  const toggleTask = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => schedulerService.updateTask(id, { completed }),
    onSuccess: invalidate,
  });
  const removeTask = useMutation({
    mutationFn: (id: string) => schedulerService.deleteTask(id),
    onSuccess: invalidate,
  });
  const bumpGoal = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => schedulerService.updateGoal(id, { progress }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sched-goals"] }),
  });
  const addOpp = useMutation({
    mutationFn: (id: string) => schedulerService.addOpportunityToScheduler(id),
    onSuccess: () => { invalidate(); toast.success("Added to your scheduler"); },
  });

  // filtering
  const now = new Date();
  const filtered = useMemo(() => {
    let list = tasks;
    if (activeCat) list = list.filter((t) => t.category === activeCat);
    if (selectedDay) list = list.filter((t) => t.dueAt && new Date(t.dueAt).toDateString() === selectedDay);
    if (filter === "today") list = list.filter((t) => t.dueAt && new Date(t.dueAt).toDateString() === now.toDateString());
    if (filter === "week") {
      const wk = new Date(now); wk.setDate(now.getDate() + 7);
      list = list.filter((t) => t.dueAt && new Date(t.dueAt) >= now && new Date(t.dueAt) <= wk);
    }
    if (filter === "overdue") list = list.filter((t) => !t.completed && t.dueAt && new Date(t.dueAt) < now);
    return list;
  }, [tasks, activeCat, filter, selectedDay]);

  const overdue = tasks.filter((t) => !t.completed && t.dueAt && new Date(t.dueAt) < now);
  const timeline = [...filtered].sort((a, b) => {
    // dated tasks first (by time), then dateless tasks
    if (a.dueAt && b.dueAt) return a.dueAt.localeCompare(b.dueAt);
    if (a.dueAt) return -1;
    if (b.dueAt) return 1;
    return 0;
  });
  const stats = overview?.greetingStats;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* PERSONALIZED HEADER */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          {greeting()}, {user?.fullName?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          You have <span className="font-semibold text-ink">{stats?.tasksRemaining ?? 0} tasks remaining</span>
          {" · "}<span className="font-semibold text-ink">{stats?.interviewsToday ?? 0} interview{stats?.interviewsToday === 1 ? "" : "s"} today</span>
          {" · "}<span className="font-semibold text-ink">{stats?.opportunitiesExpiring ?? 0} opportunities</span> expiring this week
        </p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[200px_1fr_300px]">
        {/* LEFT: calendar + filters + categories */}
        <aside className="space-y-5">
          <MonthCalendar tasks={tasks} selected={selectedDay} onPick={setSelectedDay} />
          <Card className="p-3">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Quick filters</p>
            {([["all", "All tasks"], ["today", "Today"], ["week", "This week"], ["overdue", "Overdue"]] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${filter === k ? "bg-coral/10 font-medium text-coral" : "text-ink-soft hover:bg-ink/5"}`}>
                {k === "overdue" && overdue.length > 0 && <span className="ml-auto order-2 rounded-full bg-rose-500/15 px-1.5 text-xs text-rose-500">{overdue.length}</span>}
                <span className="order-1">{lbl}</span>
              </button>
            ))}
          </Card>
          <Card className="p-3">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Categories</p>
            <div className="max-h-72 space-y-0.5 overflow-y-auto">
              <button onClick={() => setActiveCat(null)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${!activeCat ? "font-medium text-ink" : "text-ink-soft hover:bg-ink/5"}`}>All</button>
              {ALL_CATEGORIES.map((c) => (
                <button key={c} onClick={() => setActiveCat(c)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${activeCat === c ? "font-medium text-ink" : "text-ink-soft hover:bg-ink/5"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_META[c].dot}`} /> {CATEGORY_META[c].label}
                </button>
              ))}
            </div>
          </Card>
        </aside>

        {/* CENTER: goals, composer, timeline */}
        <main className="space-y-5">
          {/* Weekly goals */}
          <WeeklyGoals goals={goals} onBump={(id, p) => bumpGoal.mutate({ id, progress: p })} />

          {/* Add task composer */}
          <TaskComposer onAdd={(p) => createTask.mutate(p)} />

          {/* Overdue */}
          {overdue.length > 0 && filter !== "overdue" && (
            <Card className="border-rose-500/30 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-500"><AlertTriangle className="h-4 w-4" /> Overdue tasks</p>
              <div className="space-y-2">
                {overdue.slice(0, 3).map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={() => toggleTask.mutate({ id: t.id, completed: true })} onDelete={() => removeTask.mutate(t.id)} overdue />
                ))}
              </div>
            </Card>
          )}

          {/* Timeline / list */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display font-semibold text-ink">
                {selectedDay ? new Date(selectedDay).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })
                  : filter === "today" ? "Today" : filter === "week" ? "This week" : filter === "overdue" ? "Overdue" : "All tasks"}
                {selectedDay && <button onClick={() => setSelectedDay(null)} className="ml-2 text-xs font-normal text-coral hover:underline">clear</button>}
              </h2>
              <span className="text-xs text-ink-muted">{timeline.length} task{timeline.length === 1 ? "" : "s"}</span>
            </div>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-ink-muted">Loading...</p>
            ) : timeline.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2">
                {timeline.map((t) => (
                  <TaskRow key={t.id} task={t}
                    onToggle={() => toggleTask.mutate({ id: t.id, completed: !t.completed })}
                    onDelete={() => removeTask.mutate(t.id)} />
                ))}
              </div>
            )}
          </Card>

          {/* Consistency heatmap */}
          {overview && <Consistency days={overview.consistency} streak={overview.streak} thisMonth={overview.tasksThisMonth} />}
        </main>

        {/* RIGHT: AI insights, opportunities, events */}
        <aside className="space-y-5">
          {/* AI INSIGHTS — the hero widget */}
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-coral/15 to-fuchsia-500/10 px-4 py-3">
              <p className="flex items-center gap-2 font-display font-semibold text-ink"><Sparkles className="h-4 w-4 text-coral" /> AI Insights</p>
              <p className="text-xs text-ink-muted">Today's focus</p>
            </div>
            <div className="space-y-3 p-4">
              {(overview?.todayFocus ?? []).map((f, i) => {
                const Icon = FOCUS_ICON[f.icon] ?? Lightbulb;
                const tone = f.icon === "overdue" ? "text-rose-500" : f.icon === "deadline" ? "text-orange-500" : f.icon === "interview" ? "text-violet-500" : "text-coral";
                return (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
                    <span className="text-ink-soft">{f.text}</span>
                  </div>
                );
              })}
              {(!overview?.todayFocus || overview.todayFocus.length === 0) && (
                <p className="text-sm text-ink-muted">Add tasks and Kommunitea will surface what matters most each day.</p>
              )}
            </div>
          </Card>

          {/* Upcoming opportunities */}
          <Card className="p-4">
            <p className="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><Briefcase className="h-4 w-4 text-coral" /> Upcoming Opportunities</p>
            <div className="space-y-3">
              {opportunities.length === 0 && <p className="text-xs text-ink-muted">Nothing yet.</p>}
              {opportunities.map((o) => (
                <div key={o.id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{o.title}</p>
                    <p className="text-xs text-ink-muted">{o.org}{o.deadline ? ` · ${new Date(o.deadline).toLocaleDateString([], { day: "numeric", month: "short" })}` : ""}</p>
                  </div>
                  <button onClick={() => addOpp.mutate(o.id)} className="shrink-0 rounded-lg bg-coral/10 p-1.5 text-coral hover:bg-coral/20" title="Add to scheduler"><Plus className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </Card>

          {/* Community events */}
          <Card className="p-4">
            <p className="mb-3 flex items-center gap-2 font-display font-semibold text-ink"><CalendarClock className="h-4 w-4 text-teal-500" /> Community Events</p>
            <div className="space-y-3">
              {events.length === 0 && <p className="text-xs text-ink-muted">Nothing yet.</p>}
              {events.map((o) => (
                <div key={o.id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{o.title}</p>
                    {o.location && <p className="flex items-center gap-1 text-xs text-ink-muted"><MapPin className="h-3 w-3" /> {o.location}</p>}
                  </div>
                  <button onClick={() => addOpp.mutate(o.id)} className="shrink-0 rounded-lg bg-teal-500/10 p-1.5 text-teal-500 hover:bg-teal-500/20" title="Add to scheduler"><Plus className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */
function MonthCalendar({ tasks, selected, onPick }: { tasks: Task[]; selected: string | null; onPick: (iso: string | null) => void }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const todayStr = new Date().toDateString();
  // tasks grouped by yyyy-mm-dd
  const byDay = useMemo(() => {
    const m: Record<string, Task[]> = {};
    tasks.forEach((t) => { if (t.dueAt) { const k = new Date(t.dueAt).toDateString(); (m[k] ||= []).push(t); } });
    return m;
  }, [tasks]);

  const year = month.getFullYear(), mon = month.getMonth();
  const firstDay = (new Date(year, mon, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, mon, i + 1))];

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <button onClick={() => setMonth(new Date(year, mon - 1, 1))} className="rounded-md p-1 text-ink-muted hover:bg-ink/5"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-sm font-semibold text-ink">{month.toLocaleDateString([], { month: "long", year: "numeric" })}</span>
        <button onClick={() => setMonth(new Date(year, mon + 1, 1))} className="rounded-md p-1 text-ink-muted hover:bg-ink/5"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-ink-muted">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="py-1">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const key = d.toDateString();
          const dayTasks = byDay[key] ?? [];
          const isToday = key === todayStr;
          const isSel = selected === key;
          return (
            <div key={i} className="group relative">
              <button onClick={() => onPick(isSel ? null : key)}
                className={`relative flex h-8 w-full flex-col items-center justify-center rounded-lg text-xs transition-colors
                  ${isSel ? "bg-coral text-white" : isToday ? "bg-coral/15 font-bold text-coral" : "text-ink-soft hover:bg-ink/5"}`}>
                {d.getDate()}
                {dayTasks.length > 0 && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSel ? "bg-white" : "bg-coral"}`} />}
              </button>
              {dayTasks.length > 0 && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden -translate-x-1/2 translate-y-1 group-hover:block">
                  <div className="w-44 rounded-xl border border-sand-border bg-sand-card p-2 text-left shadow-lift">
                    <p className="mb-1 text-[10px] font-semibold uppercase text-ink-muted">{d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}</p>
                    {dayTasks.slice(0, 4).map((t) => (
                      <p key={t.id} className="flex items-center gap-1.5 truncate text-xs text-ink-soft">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_META[t.category].dot}`} /> {t.title}
                      </p>
                    ))}
                    {dayTasks.length > 4 && <p className="text-[10px] text-ink-muted">+{dayTasks.length - 4} more</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TaskRow({ task, onToggle, onDelete, overdue }: { task: Task; onToggle: () => void; onDelete: () => void; overdue?: boolean }) {
  const meta = CATEGORY_META[task.category];
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-sand-border bg-sand p-3">
      <button onClick={onToggle} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${task.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink-muted hover:border-coral"}`}>
        {task.completed && <Check className="h-3 w-3" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${task.completed ? "text-ink-muted line-through" : "text-ink"}`}>{task.title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.chip}`}>{meta.label}</span>
          {task.dueAt && <span className={`flex items-center gap-1 text-[11px] ${overdue ? "text-rose-500" : "text-ink-muted"}`}><Clock className="h-3 w-3" /> {timeLabel(task.dueAt)}</span>}
        </div>
      </div>
      <button onClick={onDelete} className="opacity-0 transition-opacity group-hover:opacity-100"><Trash2 className="h-4 w-4 text-ink-muted hover:text-rose-500" /></button>
    </div>
  );
}

function WeeklyGoals({ goals, onBump }: { goals: import("@/services/schedulerService").WeeklyGoal[]; onBump: (id: string, p: number) => void }) {
  const total = goals.reduce((s, g) => s + g.target, 0);
  const done = goals.reduce((s, g) => s + Math.min(g.progress, g.target), 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display font-semibold text-ink"><Target className="h-4 w-4 text-coral" /> Weekly Goals</h2>
        <span className="text-sm font-semibold text-coral">{pct}%</span>
      </div>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-sand-border">
        <motion.div className="h-full rounded-full bg-coral" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      {goals.length === 0 ? (
        <p className="text-sm text-ink-muted">No goals yet. Set targets like "Apply to 5 jobs" to track your week.</p>
      ) : (
        <div className="space-y-2">
          {goals.map((g) => (
            <button key={g.id} onClick={() => onBump(g.id, Math.min(g.progress + 1, g.target))}
              className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-ink/5">
              <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${g.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink-muted"}`}>
                {g.done && <Check className="h-3 w-3" />}
              </span>
              <span className={`flex-1 text-sm ${g.done ? "text-ink-muted line-through" : "text-ink"}`}>{g.title}</span>
              <span className="text-xs text-ink-muted">{g.progress}/{g.target}</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function TaskComposer({ onAdd }: { onAdd: (p: Partial<Task>) => void }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<TaskCategory>("other");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [due, setDue] = useState("");
  const [touchedCat, setTouchedCat] = useState(false);

  const onTitle = (v: string) => {
    setTitle(v);
    if (!touchedCat) setCat(suggestCategory(v)); // smart suggestion
  };
  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), category: cat, priority, dueAt: due ? new Date(due).toISOString() : null });
    setTitle(""); setDue(""); setCat("other"); setTouchedCat(false);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={title} onChange={(e) => onTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a task, deadline, interview, goal..."
          className="flex-1 rounded-xl border border-sand-border bg-sand px-3 py-2 text-sm text-ink outline-none focus:border-coral" />
        <button onClick={submit} className="flex items-center justify-center gap-1 rounded-xl bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select value={cat} onChange={(e) => { setCat(e.target.value as TaskCategory); setTouchedCat(true); }}
          className="rounded-lg border border-sand-border bg-sand px-2 py-1.5 text-xs text-ink-soft outline-none">
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
          className="rounded-lg border border-sand-border bg-sand px-2 py-1.5 text-xs text-ink-soft outline-none">
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
        <DateTimePicker value={due} onChange={setDue} />
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral"><CalendarClock className="h-6 w-6" /></div>
      <p className="mx-auto max-w-xs text-sm text-ink-muted">Plan your interviews, deadlines, networking events, projects and goals all in one place.</p>
      <p className="mt-2 text-xs text-ink-muted">Add your first task above to get started.</p>
    </div>
  );
}

function Consistency({ days, streak, thisMonth }: { days: { date: string; count: number }[]; streak: number; thisMonth: number }) {
  // build weeks (columns) of 7 days
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const level = (c: number) => c === 0 ? "bg-sand-border" : c === 1 ? "bg-emerald-500/40" : c === 2 ? "bg-emerald-500/70" : "bg-emerald-500";
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-semibold text-ink">Your Consistency</h2>
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" /> {streak} day streak</span>
          <span>{thisMonth} done this month</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col gap-1">
            {w.map((d) => <span key={d.date} title={`${d.date}: ${d.count}`} className={`h-2.5 w-2.5 rounded-sm ${level(d.count)}`} />)}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-ink-muted">
        Less <span className="h-2.5 w-2.5 rounded-sm bg-sand-border" /><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" /><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" /><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> More
      </div>
    </Card>
  );
}
