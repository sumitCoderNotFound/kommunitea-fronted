import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles, Bookmark, CalendarPlus, ExternalLink, Briefcase, ShieldCheck, MapPin, Building2, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { studyMatchService, CountryScore, UniversityRec, CityRec } from "@/services/studyMatchService";

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "text-green-600" : score >= 55 ? "text-amber-500" : "text-ink-muted";
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-sand-border" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 97.4} 97.4`} className={color} />
      </svg>
      <span className={`absolute text-sm font-bold ${color}`}>{score}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Icon className="h-5 w-5 text-coral" /> {title}
      </h2>
      {children}
    </section>
  );
}

export function StudyMatchResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: r, isLoading } = useQuery({
    queryKey: ["study-result", id],
    queryFn: () => studyMatchService.result(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading your match…</div>;
  if (!r) return <div className="py-20 text-center text-ink-muted">Match not found.</div>;

  const saveOption = async (option: Parameters<typeof studyMatchService.save>[0], label: string) => {
    try { await studyMatchService.save(option); toast.success(`Saved ${label} to your shortlist.`); }
    catch { toast.error("Couldn't save right now."); }
  };

  const addPlan = async (tasks: string[], category: string) => {
    try {
      const res = await studyMatchService.addToPlan(tasks.map((t) => ({ title: t })), category);
      toast.success(`Added ${res.created} task${res.created === 1 ? "" : "s"} to your Plan.`);
    } catch { toast.error("Couldn't add to Plan."); }
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Summary */}
      <div className="rounded-3xl bg-gradient-to-br from-ink to-ink/80 p-7 text-white">
        <div className="flex items-center gap-2 text-sm opacity-90"><Sparkles className="h-4 w-4" /> Your Study Match</div>
        <p className="mt-2 text-lg leading-relaxed">{r.overallSummary}</p>
      </div>

      {/* Country scores */}
      <Section icon={Sparkles} title="Country match scores">
        <div className="grid gap-4 sm:grid-cols-2">
          {r.countryScores.map((c: CountryScore) => (
            <div key={c.country} className="rounded-2xl border border-sand-border bg-sand-card p-5">
              <div className="flex items-start gap-4">
                <ScoreRing score={c.score} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold text-ink">{c.name}</h3>
                  <p className="text-xs text-ink-muted">Cost: {c.costLevel} · Jobs: {c.jobMarketStrength}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-ink">
                {c.whyItFits.slice(0, 2).map((w, i) => <li key={i}>✓ {w}</li>)}
              </ul>
              {c.risks.length > 0 && <p className="mt-2 text-xs text-amber-600">Watch: {c.risks[0]}</p>}
              <p className="mt-2 text-xs text-ink-muted">{c.visaNotes}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.studyMatchCountries)}>Compare</Button>
                <Button size="sm" variant="ghost" onClick={() => saveOption({ optionType: "country", title: c.name, country: c.country, officialUrl: c.official }, c.name)}>
                  <Bookmark className="mr-1 h-3.5 w-3.5" /> Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Courses */}
      <Section icon={BookOpen} title="Best-fit course suggestions">
        <div className="grid gap-4 sm:grid-cols-2">
          {r.courseRecommendations.map((c) => (
            <div key={c.course} className="rounded-2xl border border-sand-border bg-sand-card p-5">
              <h3 className="font-display font-semibold text-ink">{c.course}</h3>
              <p className="mt-1 text-sm text-ink-muted">{c.whyItFits}</p>
              <p className="mt-2 text-xs text-ink"><span className="text-ink-muted">Skills:</span> {c.skillsNeeded.join(", ")}</p>
              <p className="mt-1 text-xs text-ink"><span className="text-ink-muted">Roles:</span> {c.careerRoles.join(", ")}</p>
              <p className="mt-1 text-xs text-ink-muted">Job signal: {c.jobMarketSignal} · Sponsor: {c.sponsorPossibility}</p>
              <Button size="sm" variant="ghost" className="mt-3" onClick={() => saveOption({ optionType: "course", title: c.course, course: c.course }, c.course)}>
                <Bookmark className="mr-1 h-3.5 w-3.5" /> Save course
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* Universities */}
      <Section icon={Building2} title="University shortlist">
        <div className="space-y-3">
          {r.universityRecommendations.map((u: UniversityRec) => (
            <div key={u.university} className="flex flex-col gap-2 rounded-2xl border border-sand-border bg-sand-card p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-ink">{u.university}</h3>
                <p className="text-sm text-ink-muted">{u.course} · {u.city}</p>
                <p className="text-xs text-ink-muted">{u.entrySummary}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <a href={u.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2.5 py-1.5 text-xs text-ink hover:bg-ink/5">
                  <ExternalLink className="h-3.5 w-3.5" /> Official
                </a>
                <Button size="sm" variant="ghost" onClick={() => saveOption({ optionType: "university", title: u.university, university: u.university, city: u.city, course: u.course, officialUrl: u.officialUrl, status: "shortlisted" }, u.university)}>
                  <Bookmark className="mr-1 h-3.5 w-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => addPlan([`Research ${u.university} (${u.course})`], "university")}>
                  <CalendarPlus className="mr-1 h-3.5 w-3.5" /> Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-muted">{r.disclaimers?.university}</p>
      </Section>

      {/* Cities */}
      <Section icon={MapPin} title="City fit">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {r.cityRecommendations.map((c: CityRec) => (
            <div key={c.city} className="rounded-2xl border border-sand-border bg-sand-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink">{c.city}</h3>
                <span className="text-sm font-bold text-coral">{c.score}</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">Cost {c.costLevel} · Jobs {c.careerMarket} · Community {c.community}</p>
              <p className="mt-1 text-xs text-ink-muted">Accommodation: {c.accommodationDifficulty}</p>
              <p className="mt-2 text-xs text-ink">Best for: {c.bestFor}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Career market */}
      <Section icon={Briefcase} title="Career market after study">
        <div className="rounded-2xl border border-sand-border bg-sand-card p-5">
          <p className="text-sm text-ink"><span className="text-ink-muted">Possible roles:</span> {r.careerMarketInsights.possibleRoles.join(", ")}</p>
          <p className="mt-1 text-sm text-ink"><span className="text-ink-muted">Skills to build:</span> {r.careerMarketInsights.skillsToBuild.join(", ")}</p>
          <p className="mt-1 text-sm text-ink-muted">Job market signal: {r.careerMarketInsights.jobMarketSignal} · Sponsor visibility: {r.careerMarketInsights.sponsorVisibility}</p>
          <Button size="sm" variant="ghost" className="mt-3" onClick={() => navigate(ROUTES.planSponsorship)}>
            <Briefcase className="mr-1 h-3.5 w-3.5" /> Open Sponsored Job Finder
          </Button>
          <p className="mt-2 text-xs text-ink-muted">{r.disclaimers?.job}</p>
        </div>
      </Section>

      {/* Visa & cost */}
      <Section icon={ShieldCheck} title="Visa & cost checklist">
        <div className="rounded-2xl border border-sand-border bg-sand-card p-5 text-sm text-ink">
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
      </Section>

      {/* Action plan */}
      <Section icon={CalendarPlus} title="Your action plan">
        <div className="grid gap-4 sm:grid-cols-2">
          {([["This week", r.actionPlan.thisWeek, "university"], ["This month", r.actionPlan.thisMonth, "university"]] as const).map(([title, tasks, cat]) => (
            <div key={title} className="rounded-2xl border border-sand-border bg-sand-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink">{title}</h3>
                <Button size="sm" variant="ghost" onClick={() => addPlan([...tasks], cat)}>
                  <CalendarPlus className="mr-1 h-3.5 w-3.5" /> Add to Plan
                </Button>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-ink">
                {tasks.map((t, i) => <li key={i} className="flex gap-2"><span className="text-coral">○</span> {t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <p className="mt-8 rounded-xl border border-sand-border bg-sand px-4 py-3 text-xs text-ink-muted">{r.disclaimers?.study}</p>
    </div>
  );
}
