import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MapPin, BookOpen, Bookmark, ShieldCheck, Building2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { studyMatchService } from "@/services/studyMatchService";

const LEVEL = ["", "Low", "Affordable", "Average", "High", "Very high"];
const COMM = ["", "Small", "Some", "Good", "Strong", "Very strong"];

export function StudyMatchCitiesPage() {
  const { data } = useQuery({ queryKey: ["sm-cities"], queryFn: studyMatchService.cities });
  const cities = (data?.cities || {}) as Record<string, { cost: number; community: number; grad_market: number; accommodation_difficulty: number; best_for: string; universities: string[] }>;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><MapPin className="h-6 w-6 text-coral" /> UK city guide</h1>
      <p className="mt-1 text-ink-muted">Cost, jobs, community and accommodation at a glance.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(cities).map(([name, c]) => (
          <div key={name} className="rounded-2xl border border-sand-border bg-sand-card p-4">
            <h3 className="font-display font-semibold text-ink">{name}</h3>
            <p className="mt-1 text-xs text-ink-muted">Cost: {LEVEL[c.cost]} · Community: {COMM[c.community]}</p>
            <p className="mt-1 text-xs text-ink">{c.best_for}</p>
            <p className="mt-2 text-xs text-ink-muted">Unis: {c.universities.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyMatchCoursesPage() {
  const { data } = useQuery({ queryKey: ["sm-courses"], queryFn: studyMatchService.courses });
  const toast = useToast();
  const courses = (data?.courses || {}) as Record<string, { roles: string[]; skills: string[]; cities: string[] }>;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><BookOpen className="h-6 w-6 text-coral" /> Course market</h1>
      <p className="mt-1 text-ink-muted">Explore subjects, the roles they lead to, and where to study.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Object.entries(courses).map(([name, c]) => (
          <div key={name} className="rounded-2xl border border-sand-border bg-sand-card p-5">
            <h3 className="font-display font-semibold text-ink">{name}</h3>
            <p className="mt-1 text-xs text-ink"><span className="text-ink-muted">Roles:</span> {c.roles.join(", ")}</p>
            <p className="mt-1 text-xs text-ink"><span className="text-ink-muted">Skills:</span> {c.skills.join(", ")}</p>
            <p className="mt-1 text-xs text-ink-muted">Cities: {c.cities.join(", ")}</p>
            <Button size="sm" variant="ghost" className="mt-3"
              onClick={async () => { try { await studyMatchService.save({ optionType: "course", title: name, course: name }); toast.success("Course saved."); } catch { toast.error("Couldn't save."); } }}>
              <Bookmark className="mr-1 h-3.5 w-3.5" /> Save course
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyMatchSavedPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: saved, refetch } = useQuery({ queryKey: ["sm-saved"], queryFn: () => studyMatchService.saved() });
  const remove = async (id: number) => { try { await studyMatchService.deleteSaved(id); toast.success("Removed."); refetch(); } catch { toast.error("Couldn't remove."); } };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Bookmark className="h-6 w-6 text-coral" /> Saved shortlist</h1>
      {(!saved || saved.length === 0) ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand-border p-10 text-center">
          <p className="text-ink-muted">Nothing saved yet. Generate a Study Match and save your favourites.</p>
          <Button className="mt-4" onClick={() => navigate(ROUTES.studyMatchStart)}>Start Study Match</Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {saved.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-sand-border bg-sand-card p-4">
              <span className="rounded-lg bg-coral/10 px-2 py-1 text-xs font-medium capitalize text-coral">{s.optionType}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{s.title}</p>
                <p className="text-xs text-ink-muted capitalize">{s.status.replace(/_/g, " ")}{s.city ? ` · ${s.city}` : ""}</p>
              </div>
              {s.officialUrl && <a href={s.officialUrl} target="_blank" rel="noreferrer" className="text-ink-muted hover:text-ink"><ExternalLink className="h-4 w-4" /></a>}
              <button onClick={() => remove(s.id)} className="text-ink-muted hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LatestResultGate({ icon: Icon, title, render }: { icon: React.ElementType; title: string; render: (r: NonNullable<Awaited<ReturnType<typeof studyMatchService.results>>>[number]) => React.ReactNode }) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["study-results"], queryFn: studyMatchService.results });
  const latest = data?.[0];
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Icon className="h-6 w-6 text-coral" /> {title}</h1>
      {isLoading ? <p className="mt-6 text-ink-muted">Loading…</p> : latest ? render(latest) : (
        <div className="mt-8 rounded-2xl border border-dashed border-sand-border p-10 text-center">
          <p className="text-ink-muted">Generate a Study Match first to see this.</p>
          <Button className="mt-4" onClick={() => navigate(ROUTES.studyMatchStart)}>Start Study Match</Button>
        </div>
      )}
    </div>
  );
}

export function StudyMatchChecklistPage() {
  return <LatestResultGate icon={ShieldCheck} title="Visa & cost checklist" render={(r) => (
    <div className="mt-5 rounded-2xl border border-sand-border bg-sand-card p-5 text-sm text-ink">
      <p>• {r.visaCostChecklist.studentVisa}</p>
      <p className="mt-1">• {r.visaCostChecklist.graduateVisa}</p>
      <p className="mt-1">• {r.visaCostChecklist.financialProof}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {r.visaCostChecklist.officialLinks?.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2.5 py-1.5 text-xs hover:bg-ink/5">
            <ExternalLink className="h-3.5 w-3.5" /> {l.name}
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-muted">{r.visaCostChecklist.disclaimer}</p>
    </div>
  )} />;
}

export function StudyMatchUniversitiesPage() {
  const toast = useToast();
  return <LatestResultGate icon={Building2} title="University shortlist" render={(r) => (
    <div className="mt-5 space-y-3">
      {r.universityRecommendations.map((u) => (
        <div key={u.university} className="flex flex-col gap-2 rounded-2xl border border-sand-border bg-sand-card p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-ink">{u.university}</h3>
            <p className="text-sm text-ink-muted">{u.course} · {u.city}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a href={u.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2.5 py-1.5 text-xs hover:bg-ink/5"><ExternalLink className="h-3.5 w-3.5" /> Official</a>
            <Button size="sm" variant="ghost" onClick={async () => { try { await studyMatchService.save({ optionType: "university", title: u.university, university: u.university, city: u.city, course: u.course, officialUrl: u.officialUrl, status: "shortlisted" }); toast.success("Saved."); } catch { toast.error("Couldn't save."); } }}>
              <Bookmark className="mr-1 h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>
      ))}
      <p className="mt-2 text-xs text-ink-muted">{r.disclaimers?.university}</p>
    </div>
  )} />;
}
