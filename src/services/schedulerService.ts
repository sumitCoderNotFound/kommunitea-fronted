import { apiClient } from "./apiClient";

export type TaskCategory =
  | "interview" | "job_deadline" | "accommodation" | "visa" | "university"
  | "projects" | "networking" | "career_fair" | "community_event"
  | "personal_goal" | "certification" | "referral_followup" | "other";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: TaskCategory;
  priority: "high" | "medium" | "low";
  dueAt: string | null;
  completed: boolean;
  completedAt: string | null;
  source: string;
  createdAt: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  target: number;
  progress: number;
  done: boolean;
  weekStart: string;
}

export interface Opportunity {
  id: string;
  kind: "opportunity" | "event";
  title: string;
  org?: string;
  location?: string;
  deadline: string | null;
}

export interface FocusItem { icon: string; text: string; }
export interface ConsistencyDay { date: string; count: number; }
export interface Overview {
  greetingStats: { tasksRemaining: number; interviewsToday: number; opportunitiesExpiring: number };
  todayFocus: FocusItem[];
  consistency: ConsistencyDay[];
  streak: number;
  longestStreak: number;
  tasksThisMonth: number;
}

type Paginated<T> = { results: T[] } | T[];
const rows = <T,>(d: Paginated<T>): T[] => (Array.isArray(d) ? d : d.results);

export const schedulerService = {
  async tasks() {
    const { data } = await apiClient.get<Paginated<Task>>("/scheduler/tasks/");
    return rows(data);
  },
  async createTask(payload: Partial<Task>) {
    const { data } = await apiClient.post<Task>("/scheduler/tasks/", payload);
    return data;
  },
  async updateTask(id: string, payload: Partial<Task>) {
    const { data } = await apiClient.patch<Task>(`/scheduler/tasks/${id}/`, payload);
    return data;
  },
  async deleteTask(id: string) {
    await apiClient.delete(`/scheduler/tasks/${id}/`);
  },
  async goals() {
    const { data } = await apiClient.get<Paginated<WeeklyGoal>>("/scheduler/goals/");
    return rows(data);
  },
  async createGoal(payload: Partial<WeeklyGoal>) {
    const { data } = await apiClient.post<WeeklyGoal>("/scheduler/goals/", payload);
    return data;
  },
  async updateGoal(id: string, payload: Partial<WeeklyGoal>) {
    const { data } = await apiClient.patch<WeeklyGoal>(`/scheduler/goals/${id}/`, payload);
    return data;
  },
  async opportunities(kind?: "opportunity" | "event") {
    const { data } = await apiClient.get<Opportunity[]>("/scheduler/opportunities/", { params: kind ? { kind } : {} });
    return data;
  },
  async addOpportunityToScheduler(opportunityId: string) {
    const { data } = await apiClient.post<Task>("/scheduler/opportunities/", { opportunityId });
    return data;
  },
  async overview() {
    const { data } = await apiClient.get<Overview>("/scheduler/overview/");
    return data;
  },
};

/* Rule-based category suggestion from a task title (no paid AI). */
export function suggestCategory(title: string): TaskCategory {
  const t = title.toLowerCase();
  if (t.includes("interview")) return "interview";
  if (t.includes("deadline")) return "job_deadline";
  if (t.includes("rent") || t.includes("accommodation") || t.includes("flat") || t.includes("house")) return "accommodation";
  if (t.includes("visa") || t.includes("psw") || t.includes("brp")) return "visa";
  if (t.includes("assignment") || t.includes("exam") || t.includes("coursework") || t.includes("lecture")) return "university";
  if (t.includes("network")) return "networking";
  if (t.includes("career fair") || t.includes("fair")) return "career_fair";
  if (t.includes("meetup") || t.includes("event") || t.includes("workshop")) return "community_event";
  if (t.includes("project") || t.includes("portfolio") || t.includes("hackathon")) return "projects";
  if (t.includes("cert") || t.includes("course")) return "certification";
  if (t.includes("referral") || t.includes("follow up") || t.includes("follow-up")) return "referral_followup";
  return "other";
}

/* Category colour + label map (Tailwind classes), consistent with the design language. */
export const CATEGORY_META: Record<TaskCategory, { label: string; dot: string; chip: string }> = {
  interview:         { label: "Interview",          dot: "bg-violet-500",  chip: "bg-violet-500/10 text-violet-500" },
  job_deadline:      { label: "Job Deadline",       dot: "bg-coral",       chip: "bg-coral/10 text-coral" },
  accommodation:     { label: "Accommodation",      dot: "bg-amber-500",   chip: "bg-amber-500/10 text-amber-500" },
  visa:              { label: "Visa",               dot: "bg-rose-500",    chip: "bg-rose-500/10 text-rose-500" },
  university:        { label: "University",         dot: "bg-sky-500",     chip: "bg-sky-500/10 text-sky-500" },
  projects:          { label: "Projects",           dot: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-500" },
  networking:        { label: "Networking",         dot: "bg-fuchsia-500", chip: "bg-fuchsia-500/10 text-fuchsia-500" },
  career_fair:       { label: "Career Fair",        dot: "bg-indigo-500",  chip: "bg-indigo-500/10 text-indigo-500" },
  community_event:   { label: "Community Event",    dot: "bg-teal-500",    chip: "bg-teal-500/10 text-teal-500" },
  personal_goal:     { label: "Personal Goal",      dot: "bg-pink-500",    chip: "bg-pink-500/10 text-pink-500" },
  certification:     { label: "Certification",      dot: "bg-cyan-500",    chip: "bg-cyan-500/10 text-cyan-500" },
  referral_followup: { label: "Referral Follow-up", dot: "bg-lime-500",    chip: "bg-lime-500/10 text-lime-600" },
  other:             { label: "Other",              dot: "bg-slate-400",   chip: "bg-slate-400/10 text-ink-soft" },
};
