import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, GitCompare, X, Bookmark, CalendarPlus, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";
import { catalogService, studyMatchService, CityInsight } from "@/services/studyMatchService";

const REGIONS = ["", "London", "South East", "South West", "East of England", "West Midlands", "East Midlands",
  "North West", "North East", "Yorkshire and the Humber", "Scotland", "Wales", "Northern Ireland"];
const TABS = [
  { key: "all", label: "All cities" }, { key: "affordable", label: "Affordable" },
  { key: "jobs", label: "Best for jobs" }, { key: "life", label: "Best student life" },
  { key: "tech", label: "Tech/career hubs" }, { key: "saved", label: "Saved" },
] as const;
const SORTS = ["Best match", "Lowest cost", "Best for jobs", "Best student life", "Most universities"];

function Pill({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return <span className={`rounded-md px-2 py-0.5 text-[11px] ${tone || "bg-sand text-ink-muted"}`}>{label}: <span className="font-medium text-ink">{value}</span></span>;
}
const STRONG = (s: string) => (["Strong", "Very strong"].includes(s) ? "bg-green-100 text-green-700" : s === "Moderate" ? "bg-amber-100 text-amber-700" : "bg-sand text-ink-muted");

export function CityGuidePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [region, setRegion] = useState("");
  const [sort, setSort] = useState("Best match");
  const [cities, setCities] = useState<CityInsight[]>([]);
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState<CityInsight[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const loadSaved = () => studyMatchService.saved("city").then((s) => setSavedNames(new Set(s.map((x) => x.title)))).catch(() => {});
  useEffect(() => { loadSaved(); }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (debounced) params.search = debounced;
    if (region) params.region = region;
    catalogService.cityInsights(params)
      .then((d) => { setCities(d.cities); setLastUpdated(d.lastUpdated); setDisclaimer(d.disclaimer); })
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [debounced, region]);

  const visible = useMemo(() => {
    let list = [...cities];
    if (tab === "saved") list = list.filter((c) => savedNames.has(c.city));
    if (tab === "affordable") list = list.filter((c) => ["Low", "Low-medium", "Medium"].includes(c.costLevel));
    if (tab === "jobs") list = list.filter((c) => ["Strong", "Very strong"].includes(c.graduateJobMarketSignal));
    if (tab === "life") list = list.filter((c) => ["Strong", "Very strong"].includes(c.studentLifeSignal));
    if (tab === "tech") list = list.filter((c) => c.bestForCareerAreas.some((a) => /tech|data|finance|cyber|digital/i.test(a)));
    const by: Record<string, (a: CityInsight, b: CityInsight) => number> = {
      "Best match": (a, b) => b.overallCityScore - a.overallCityScore,
      "Lowest cost": (a, b) => a.monthlyLivingCostBand.localeCompare(b.monthlyLivingCostBand),
      "Best for jobs": (a, b) => b.graduateJobMarketSignal.localeCompare(a.graduateJobMarketSignal),
      "Best student life": (a, b) => b.studentLifeSignal.localeCompare(a.studentLifeSignal),
      "Most universities": (a, b) => b.topUniversities.length - a.topUniversities.length,
    };
    return list.sort(by[sort]);
  }, [cities, tab, savedNames, sort]);

  const toggleCompare = (c: CityInsight) =>
    setCompare((s) => (s.find((x) => x.id === c.id) ? s.filter((x) => x.id !== c.id) : s.length < 4 ? [...s, c] : s));

  const save = async (c: CityInsight) => {
    try { await studyMatchService.save({ optionType: "city", title: c.city, city: c.city, status: "researching", matchScore: c.overallCityScore, sourceName: c.sourceName, sourceUrl: c.sourceUrl }); toast.success(`Saved ${c.city}.`); loadSaved(); }
    catch { toast.error("Couldn't save."); }
  };
  const addChecklist = async (c: CityInsight) => {
    try {
      const tasks = [
        { title: `Check accommodation areas in ${c.city}` },
        { title: `Compare universities in ${c.city}` },
        { title: `Estimate monthly budget for ${c.city}` },
        { title: `Search part-time jobs in ${c.city}` },
      ];
      const r = await studyMatchService.addToPlan(tasks, "university");
      toast.success(`Added ${r.created} ${c.city} tasks to your Plan.`);
    } catch { toast.error("Couldn't add to Plan."); }
  };

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><MapPin className="h-6 w-6 text-coral" /> UK City Guide</h1>
      <p className="mt-1 text-sm text-ink-muted">Compare cost, jobs, student life, accommodation and universities before choosing your study city.</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
        {lastUpdated && <span>Last updated {new Date(lastUpdated).toLocaleDateString()}</span>}
        {compare.length >= 2 && <Button size="sm" className="ml-auto" onClick={() => setCompareOpen(true)}><GitCompare className="mr-1 h-4 w-4" /> Compare ({compare.length})</Button>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${tab === t.key ? "bg-coral text-white" : "bg-sand-card text-ink-muted hover:text-ink"}`}>
            {t.label}{t.key === "saved" ? ` (${savedNames.size})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search city or region…" className="h-11 w-full rounded-xl border border-sand-border bg-sand-card pl-9 pr-3 text-sm focus-visible:focus-ring" />
        </div>
        <div className="w-full sm:w-48"><Combobox label="" value={region} onChange={setRegion} options={REGIONS} placeholder="All regions" /></div>
        <div className="w-full sm:w-48"><Combobox label="" value={sort} onChange={setSort} options={SORTS} placeholder="Sort by" /></div>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-60 animate-pulse rounded-2xl bg-sand-border/40" />)}</div>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand-border p-10 text-center text-ink-muted">{tab === "saved" ? "No saved cities yet." : "No cities match your filters."}</div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visible.map((c) => (
            <div key={c.id} className="rounded-2xl border border-sand-border bg-sand-card p-5">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => navigate(`/study-match/cities/${c.slug}`)} className="text-left">
                  <h3 className="font-display text-lg font-bold text-ink">{c.city}</h3>
                  <p className="text-xs text-ink-muted">{c.region}</p>
                </button>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-coral/10 px-2.5 py-1 text-sm font-bold text-coral">{c.overallCityScore}/100</span>
                  <label className="flex items-center gap-1 text-[11px] text-ink"><input type="checkbox" checked={!!compare.find((x) => x.id === c.id)} onChange={() => toggleCompare(c)} /> Compare</label>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-muted">Living cost: {c.monthlyLivingCostBand} <span className="text-[10px]">(indicative)</span></p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Pill label="Cost" value={c.costLevel} />
                <span className={`rounded-md px-2 py-0.5 text-[11px] ${STRONG(c.partTimeJobSignal)}`}>Part-time: {c.partTimeJobSignal}</span>
                <span className={`rounded-md px-2 py-0.5 text-[11px] ${STRONG(c.graduateJobMarketSignal)}`}>Grad jobs: {c.graduateJobMarketSignal}</span>
                <span className={`rounded-md px-2 py-0.5 text-[11px] ${STRONG(c.studentLifeSignal)}`}>Life: {c.studentLifeSignal}</span>
                <span className={`rounded-md px-2 py-0.5 text-[11px] ${STRONG(c.internationalCommunitySignal)}`}>Community: {c.internationalCommunitySignal}</span>
                <Pill label="Accommodation" value={c.accommodationDifficulty} />
              </div>
              {c.topUniversities.length > 0 && (
                <p className="mt-2 flex items-start gap-1 text-xs text-ink-muted"><Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {c.topUniversities.slice(0, 3).join(", ")}</p>
              )}
              {c.bestForSubjects.length > 0 && <p className="mt-1 text-xs text-ink-muted">Best for: {c.bestForSubjects.join(", ")}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => save(c)}><Bookmark className="mr-1 h-3.5 w-3.5" /> {savedNames.has(c.city) ? "Saved" : "Save"}</Button>
                <Button size="sm" variant="ghost" onClick={() => addChecklist(c)}><CalendarPlus className="mr-1 h-3.5 w-3.5" /> Add to Plan</Button>
                <button onClick={() => navigate(`/study-match/cities/${c.slug}`)} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-coral">View details <ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-ink-muted">{disclaimer}</p>

      {compareOpen && compare.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setCompareOpen(false)}>
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-sand-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold text-ink">Compare cities</h2><button onClick={() => setCompareOpen(false)} className="text-ink-muted hover:text-ink"><X className="h-5 w-5" /></button></div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-sand-border text-ink-muted"><th className="py-2 pr-3 font-medium">Metric</th>{compare.map((c) => <th key={c.id} className="py-2 pr-3 font-medium text-ink">{c.city}</th>)}</tr></thead>
                <tbody>
                  {([["Fit score", (c: CityInsight) => `${c.overallCityScore}/100`], ["Region", (c) => c.region], ["Cost", (c) => c.costLevel],
                    ["Monthly cost", (c) => c.monthlyLivingCostBand], ["Part-time jobs", (c) => c.partTimeJobSignal], ["Grad market", (c) => c.graduateJobMarketSignal],
                    ["Student life", (c) => c.studentLifeSignal], ["Community", (c) => c.internationalCommunitySignal], ["Accommodation", (c) => c.accommodationDifficulty],
                    ["Best for", (c) => c.bestForSubjects.join(", ")],
                  ] as [string, (c: CityInsight) => string][]).map(([label, get]) => (
                    <tr key={label} className="border-b border-sand-border/50"><td className="py-2 pr-3 text-ink-muted">{label}</td>{compare.map((c) => <td key={c.id} className="py-2 pr-3 text-ink">{get(c)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-muted">Best-fit city to research — not a guarantee. Confirm current costs and accommodation before deciding.</p>
          </div>
        </div>
      )}
    </div>
  );
}
