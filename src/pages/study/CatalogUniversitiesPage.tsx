import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Search, Bookmark, GitCompare, X, ExternalLink, CalendarPlus, ShieldCheck, BadgeCheck, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";
import { catalogService, studyMatchService, CatalogUniversity, SPONSOR_LABEL } from "@/services/studyMatchService";

const REGIONS = ["London", "South East", "South West", "East of England", "West Midlands", "East Midlands",
  "North West", "North East", "Yorkshire and the Humber", "Scotland", "Wales", "Northern Ireland"];

function SponsorBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    licensed: "bg-green-100 text-green-700", not_listed: "bg-red-100 text-red-600", unknown: "bg-sand text-ink-muted",
  };
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${map[status] || map.unknown}`}><ShieldCheck className="h-3 w-3" /> {SPONSOR_LABEL[status] || status}</span>;
}

export function CatalogUniversitiesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);
  const [region, setRegion] = useState("");
  const [rgOnly, setRgOnly] = useState(false);
  const [sponsoredOnly, setSponsoredOnly] = useState(false);
  const [data, setData] = useState<{ count: number; results: CatalogUniversity[] }>({ count: 0, results: [] });
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState<CatalogUniversity[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Load saved university titles (for the Saved tab + "saved" markers).
  const loadSaved = () => studyMatchService.saved("university").then((s) => setSavedNames(new Set(s.map((x) => x.title)))).catch(() => {});
  useEffect(() => { loadSaved(); }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean> = { pageSize: 30 };
    if (debounced) params.search = debounced;
    if (region) params.region = region;
    if (rgOnly) params.russellGroup = true;
    if (sponsoredOnly) params.sponsorStatus = "licensed";
    catalogService.universities(params)
      .then((res) => setData({ count: res.count, results: res.results }))
      .catch(() => setData({ count: 0, results: [] }))
      .finally(() => setLoading(false));
  }, [debounced, region, rgOnly, sponsoredOnly]);

  const visible = useMemo(
    () => (tab === "saved" ? data.results.filter((u) => savedNames.has(u.universityName)) : data.results),
    [tab, data.results, savedNames],
  );

  const toggleCompare = (u: CatalogUniversity) =>
    setCompare((c) => (c.find((x) => x.id === u.id) ? c.filter((x) => x.id !== u.id) : c.length < 4 ? [...c, u] : c));

  const save = async (u: CatalogUniversity) => {
    try {
      await studyMatchService.save({
        optionType: "university", title: u.universityName, university: u.universityName, city: u.city,
        officialUrl: u.websiteUrl, status: "shortlisted", sourceName: "GOV.UK register / official",
        sourceUrl: u.sourceUrl || u.websiteUrl,
      });
      toast.success(`Saved ${u.universityName}.`);
      loadSaved();
    } catch { toast.error("Couldn't save right now."); }
  };
  const addDeadline = async (u: CatalogUniversity) => {
    try {
      const r = await studyMatchService.addToPlan([{ title: `Application deadline — ${u.universityName}` }], "university");
      toast.success(`Added ${r.created} task to your Plan.`);
    } catch { toast.error("Couldn't add to Plan."); }
  };

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Building2 className="h-6 w-6 text-coral" /> Universities</h1>
      <p className="mt-1 text-sm text-ink-muted">Real UK universities with live UKVI sponsor status. Tick 2–4 to compare. Always confirm details on the official page.</p>

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        {(["all", "saved"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === t ? "bg-coral text-white" : "bg-sand-card text-ink-muted hover:text-ink"}`}>
            {t === "all" ? "All universities" : `Saved (${savedNames.size})`}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search universities…"
            className="h-11 w-full rounded-xl border border-sand-border bg-sand-card pl-9 pr-3 text-sm focus-visible:focus-ring" />
        </div>
        <div className="w-full sm:w-56"><Combobox label="" value={region} onChange={setRegion} options={["", ...REGIONS]} placeholder="All regions" /></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setRgOnly((v) => !v)} className={`rounded-full border px-3 py-1.5 text-xs ${rgOnly ? "border-coral bg-coral text-white" : "border-sand-border text-ink"}`}>Russell Group</button>
        <button onClick={() => setSponsoredOnly((v) => !v)} className={`rounded-full border px-3 py-1.5 text-xs ${sponsoredOnly ? "border-coral bg-coral text-white" : "border-sand-border text-ink"}`}>Licensed sponsor</button>
        {(region || rgOnly || sponsoredOnly || search) && (
          <button onClick={() => { setRegion(""); setRgOnly(false); setSponsoredOnly(false); setSearch(""); }} className="text-xs text-ink-muted underline">Clear filters</button>
        )}
        {compare.length >= 2 && <Button size="sm" className="ml-auto" onClick={() => setCompareOpen(true)}><GitCompare className="mr-1 h-4 w-4" /> Compare ({compare.length})</Button>}
      </div>

      {/* List */}
      {loading ? (
        <div className="mt-5 space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-sand-border/40" />)}</div>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand-border p-10 text-center text-ink-muted">
          {tab === "saved" ? "No saved universities yet — tap Save on any university." : "No universities match your filters."}
        </div>
      ) : (
        <>
          <p className="mt-4 text-xs text-ink-muted">{tab === "all" ? `${data.count} universities` : `${visible.length} saved`}</p>
          <div className="mt-2 space-y-3">
            {visible.map((u) => (
              <div key={u.id} className="rounded-2xl border border-sand-border bg-sand-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button onClick={() => navigate(ROUTES.studyMatchUniversityDetail(u.id))} className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-semibold text-ink">{u.universityName}</h3>
                      {u.isRussellGroup && <span className="rounded-md bg-coral/10 px-2 py-0.5 text-[11px] font-medium text-coral">Russell Group</span>}
                      <SponsorBadge status={u.ukviSponsorStatus} />
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">{[u.city, u.region].filter(Boolean).join(", ")} · {u.courseCount} course{u.courseCount === 1 ? "" : "s"}</p>
                  </button>
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink">
                    <input type="checkbox" checked={!!compare.find((x) => x.id === u.id)} onChange={() => toggleCompare(u)} /> Compare
                  </label>
                </div>
                {u.lastCheckedAt && <p className="mt-1 text-[11px] text-ink-muted">Sponsor status checked {new Date(u.lastCheckedAt).toLocaleDateString()}{u.sponsorRating ? ` · ${u.sponsorRating}` : ""}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={u.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2.5 py-1.5 text-xs text-ink hover:bg-ink/5"><ExternalLink className="h-3.5 w-3.5" /> Official</a>
                  <Button size="sm" variant="ghost" onClick={() => save(u)}><Bookmark className="mr-1 h-3.5 w-3.5" /> {savedNames.has(u.universityName) ? "Saved" : "Save"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => addDeadline(u)}><CalendarPlus className="mr-1 h-3.5 w-3.5" /> Add deadline to Plan</Button>
                  <button onClick={() => navigate(ROUTES.studyMatchUniversityDetail(u.id))} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-coral">View details <ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Compare modal */}
      {compareOpen && compare.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setCompareOpen(false)}>
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-sand-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">Compare universities</h2>
              <button onClick={() => setCompareOpen(false)} className="text-ink-muted hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-sand-border text-ink-muted">
                  <th className="py-2 pr-3 font-medium">Field</th>
                  {compare.map((u) => <th key={u.id} className="py-2 pr-3 font-medium text-ink">{u.universityName}</th>)}
                </tr></thead>
                <tbody>
                  {([
                    ["City", (u: CatalogUniversity) => u.city], ["Region", (u) => u.region],
                    ["Russell Group", (u) => (u.isRussellGroup ? "Yes" : "No")],
                    ["Sponsor status", (u) => SPONSOR_LABEL[u.ukviSponsorStatus] || u.ukviSponsorStatus],
                    ["Sponsor rating", (u) => u.sponsorRating || "—"],
                    ["Courses listed", (u) => String(u.courseCount)],
                  ] as [string, (u: CatalogUniversity) => string][]).map(([label, get]) => (
                    <tr key={label} className="border-b border-sand-border/50">
                      <td className="py-2 pr-3 text-ink-muted">{label}</td>
                      {compare.map((u) => <td key={u.id} className="py-2 pr-3 text-ink">{get(u)}</td>)}
                    </tr>
                  ))}
                  <tr><td className="py-2 pr-3 text-ink-muted">Official</td>
                    {compare.map((u) => <td key={u.id} className="py-2 pr-3"><a href={u.websiteUrl} target="_blank" rel="noreferrer" className="text-coral underline">Open</a></td>)}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs text-ink-muted"><BadgeCheck className="h-3.5 w-3.5" /> Sponsor data from the GOV.UK register. Confirm fees & entry on each official page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
