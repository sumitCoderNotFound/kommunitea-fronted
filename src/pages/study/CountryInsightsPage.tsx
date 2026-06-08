import { useEffect, useState } from "react";
import { Globe2, GitCompare, X, ExternalLink, Bookmark, CalendarPlus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { catalogService, studyMatchService, CountryInsight } from "@/services/studyMatchService";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-ink-muted">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-sand-border/60"><div className="h-full rounded-full bg-coral" style={{ width: `${value}%` }} /></div>
      <span className="w-7 text-right font-medium text-ink">{value}</span>
    </div>
  );
}

export function CountryInsightsPage() {
  const toast = useToast();
  const [countries, setCountries] = useState<CountryInsight[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [compare, setCompare] = useState<CountryInsight[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    catalogService.countryInsights()
      .then((d) => { setCountries(d.countries); setLastUpdated(d.lastUpdated); setDisclaimer(d.disclaimer); })
      .catch(() => setStale(true))
      .finally(() => setLoading(false));
  }, []);

  const toggleCompare = (c: CountryInsight) =>
    setCompare((s) => (s.find((x) => x.id === c.id) ? s.filter((x) => x.id !== c.id) : s.length < 4 ? [...s, c] : s));

  const save = async (c: CountryInsight) => {
    try { await studyMatchService.save({ optionType: "country", title: c.name, officialUrl: c.sourceUrl, status: "researching", matchScore: c.overallScore, sourceName: c.sourceName, sourceUrl: c.sourceUrl }); toast.success(`Saved ${c.name}.`); }
    catch { toast.error("Couldn't save."); }
  };
  const addPlan = async (c: CountryInsight) => {
    try { const r = await studyMatchService.addToPlan([{ title: `Research studying in ${c.name}` }], "university"); toast.success(`Added ${r.created} task to Plan.`); }
    catch { toast.error("Couldn't add to Plan."); }
  };

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Globe2 className="h-6 w-6 text-coral" /> Country intelligence</h1>
      <p className="mt-1 text-sm text-ink-muted">Indicative scores to compare study destinations. Not official statistics — always confirm visa, fees and work rules on the official source.</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
        {lastUpdated && <span>Last updated {new Date(lastUpdated).toLocaleDateString()}</span>}
        {compare.length >= 2 && <Button size="sm" className="ml-auto" onClick={() => setCompareOpen(true)}><GitCompare className="mr-1 h-4 w-4" /> Compare ({compare.length})</Button>}
      </div>

      {stale && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4" /> Some data may be older than usual. Please try again shortly.
        </div>
      )}

      {loading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-sand-border/40" />)}</div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {countries.map((c) => (
            <div key={c.id} className="rounded-2xl border border-sand-border bg-sand-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{c.name}</h3>
                  <p className="text-xs text-ink-muted">Tuition: {c.tuitionBand} · Living: {c.livingCostBand}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-coral/10 px-2.5 py-1 text-sm font-bold text-coral">{c.overallScore}/100</span>
                  <label className="flex items-center gap-1 text-[11px] text-ink"><input type="checkbox" checked={!!compare.find((x) => x.id === c.id)} onChange={() => toggleCompare(c)} /> Compare</label>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <ScoreBar label="Study" value={c.studyScore} />
                <ScoreBar label="Work" value={c.workScore} />
                <ScoreBar label="Budget" value={c.budgetScore} />
                <ScoreBar label="Visa ease" value={c.visaScore} />
                <ScoreBar label="Student life" value={c.studentLifeScore} />
              </div>
              {c.bestForSubjects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">{c.bestForSubjects.slice(0, 4).map((s) => <span key={s} className="rounded-md bg-sand px-2 py-0.5 text-[11px] text-ink-muted">{s}</span>)}</div>
              )}
              {c.weeklyUpdateSummary && <p className="mt-3 text-xs text-ink">{c.weeklyUpdateSummary}</p>}
              <p className="mt-2 text-[11px] text-ink-muted">Post-study: {c.postStudyWorkSummary} · Part-time: {c.partTimeWorkSummary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.sourceUrl && <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2.5 py-1.5 text-xs text-ink hover:bg-ink/5"><ExternalLink className="h-3.5 w-3.5" /> Official</a>}
                <Button size="sm" variant="ghost" onClick={() => save(c)}><Bookmark className="mr-1 h-3.5 w-3.5" /> Save</Button>
                <Button size="sm" variant="ghost" onClick={() => addPlan(c)}><CalendarPlus className="mr-1 h-3.5 w-3.5" /> Add to Plan</Button>
              </div>
              {c.lastCheckedAt && <p className="mt-2 text-[11px] text-ink-muted">{c.sourceName} · checked {new Date(c.lastCheckedAt).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-ink-muted">{disclaimer}</p>

      {compareOpen && compare.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setCompareOpen(false)}>
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-sand-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold text-ink">Compare countries</h2><button onClick={() => setCompareOpen(false)} className="text-ink-muted hover:text-ink"><X className="h-5 w-5" /></button></div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-sand-border text-ink-muted"><th className="py-2 pr-3 font-medium">Metric</th>{compare.map((c) => <th key={c.id} className="py-2 pr-3 font-medium text-ink">{c.name}</th>)}</tr></thead>
                <tbody>
                  {([["Overall", (c: CountryInsight) => `${c.overallScore}/100`], ["Study", (c) => `${c.studyScore}`], ["Work", (c) => `${c.workScore}`],
                    ["Budget", (c) => `${c.budgetScore}`], ["Visa ease", (c) => `${c.visaScore}`], ["Student life", (c) => `${c.studentLifeScore}`],
                    ["Tuition", (c) => c.tuitionBand], ["Living cost", (c) => c.livingCostBand], ["Post-study", (c) => c.postStudyWorkSummary],
                  ] as [string, (c: CountryInsight) => string][]).map(([label, get]) => (
                    <tr key={label} className="border-b border-sand-border/50"><td className="py-2 pr-3 text-ink-muted">{label}</td>{compare.map((c) => <td key={c.id} className="py-2 pr-3 text-ink">{get(c)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-muted">Indicative comparison — confirm visa, fees and work rules on each official source.</p>
          </div>
        </div>
      )}
    </div>
  );
}
