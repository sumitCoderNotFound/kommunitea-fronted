import { useEffect, useState, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Wallet, Building2, Briefcase, Users, Home, Bookmark, CalendarPlus, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { catalogService, studyMatchService, CityInsight } from "@/services/studyMatchService";

function Section({ icon: Icon, title, children }: { icon: typeof Wallet; title: string; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-sand-border bg-sand-card p-5">
      <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink"><Icon className="h-4 w-4 text-coral" /> {title}</h2>
      <div className="mt-2 text-sm text-ink-muted">{children}</div>
    </div>
  );
}

export function CityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [c, setC] = useState<CityInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (slug) catalogService.city(slug).then(setC).catch(() => setC(null)).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <div className="py-20 text-center text-ink-muted">Loading…</div>;
  if (!c) return <div className="py-20 text-center text-ink-muted">City not found.</div>;

  const save = async () => {
    try { await studyMatchService.save({ optionType: "city", title: c.city, city: c.city, status: "researching", matchScore: c.overallCityScore, sourceName: c.sourceName, sourceUrl: c.sourceUrl }); toast.success("Saved."); }
    catch { toast.error("Couldn't save."); }
  };
  const addChecklist = async () => {
    try {
      const r = await studyMatchService.addToPlan([
        { title: `Check accommodation areas in ${c.city}` },
        { title: `Compare universities in ${c.city}` },
        { title: `Estimate monthly budget for ${c.city}` },
        { title: `Search part-time jobs in ${c.city}` },
      ], "university");
      toast.success(`Added ${r.created} tasks to Plan.`);
    } catch { toast.error("Couldn't add to Plan."); }
  };

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <button onClick={() => navigate(ROUTES.studyMatchCities)} className="text-sm text-ink-muted hover:text-ink">← UK City Guide</button>
      <div className="mt-3 rounded-2xl border border-sand-border bg-sand-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><MapPin className="h-6 w-6 text-coral" /> {c.city}</h1>
            <p className="mt-1 text-sm text-ink-muted">{c.region}, {c.country}</p>
          </div>
          <span className="rounded-full bg-coral/10 px-3 py-1.5 text-base font-bold text-coral">{c.overallCityScore}/100</span>
        </div>
        <p className="mt-3 text-sm text-ink">{c.citySummary}</p>
        {c.scoreBreakdown && (
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {Object.entries(c.scoreBreakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs"><span className="text-ink-muted capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="font-medium text-ink">{v}</span></div>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={save}><Bookmark className="mr-1 h-3.5 w-3.5" /> Save city</Button>
          <Button size="sm" variant="ghost" onClick={addChecklist}><CalendarPlus className="mr-1 h-3.5 w-3.5" /> Add research to Plan</Button>
        </div>
      </div>

      <Section icon={Wallet} title="Cost & budget">
        <p>Indicative monthly living cost: <span className="font-medium text-ink">{c.monthlyLivingCostBand}</span> · Rent level: {c.rentLevel} · Cost level: {c.costLevel}</p>
        <p className="mt-1 text-xs">Remember a tenancy deposit (often 4–6 weeks' rent) on top of monthly costs. Indicative city cost — always check current accommodation and living costs.</p>
      </Section>

      <Section icon={Building2} title="Universities">
        {c.topUniversities.length ? (
          <ul className="space-y-1">{c.topUniversities.map((u) => <li key={u}>{u}</li>)}</ul>
        ) : <p>Browse universities in this city in the catalog.</p>}
        <button onClick={() => navigate(ROUTES.studyMatchUniversities)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-coral">View universities <ExternalLink className="h-3.5 w-3.5" /></button>
      </Section>

      <Section icon={Briefcase} title="Jobs & career">
        <p>Part-time jobs: <span className="font-medium text-ink">{c.partTimeJobSignal}</span> · Graduate market: <span className="font-medium text-ink">{c.graduateJobMarketSignal}</span></p>
        {c.mainIndustries.length > 0 && <p className="mt-1">Main industries: {c.mainIndustries.join(", ")}</p>}
        <p className="mt-1 text-xs">Job market signal is indicative and does not guarantee employment.</p>
      </Section>

      <Section icon={Users} title="Student life & community">
        <p>Student life: <span className="font-medium text-ink">{c.studentLifeSignal}</span> · International community: <span className="font-medium text-ink">{c.internationalCommunitySignal}</span></p>
        <button onClick={() => navigate(ROUTES.tribe)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-coral">Find communities in Tribe <ExternalLink className="h-3.5 w-3.5" /></button>
      </Section>

      <Section icon={Home} title="Accommodation">
        <p>Difficulty: <span className="font-medium text-ink">{c.accommodationDifficulty}</span> · Rent level: {c.rentLevel}</p>
        <p className="mt-1 text-xs">Accommodation difficulty is indicative. Start searching early and never pay a deposit before verifying the property.</p>
      </Section>

      {c.whatToBeCarefulAbout && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {c.whatToBeCarefulAbout}
        </div>
      )}
      <p className="mt-4 text-xs text-ink-muted">{c.sourceName} · indicative signals. Always verify current rent, job availability and official university information before deciding.</p>
    </div>
  );
}
