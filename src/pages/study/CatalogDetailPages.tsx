import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen, Search, ExternalLink, Bookmark, CalendarPlus, ShieldCheck, BadgeCheck, AlertTriangle, ChevronRight, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";
import { catalogService, studyMatchService, CatalogUniversity, CatalogCourse, SPONSOR_LABEL, courseFeeDisplay, FeeBand } from "@/services/studyMatchService";

const SUBJECTS = ["", "Computer Science", "Data Science", "Artificial Intelligence", "Cyber Security",
  "Business Analytics", "Finance", "Engineering", "Public Health", "Nursing / Healthcare", "Management"];

function VerifiedBadge({ course }: { course: { feeVerified: boolean; needsVerification: boolean; dataConfidence: string } }) {
  if (course.feeVerified) return <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700"><BadgeCheck className="h-3 w-3" /> Verified</span>;
  return <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700"><AlertTriangle className="h-3 w-3" /> Needs review</span>;
}

function feeShort(c: CatalogCourse) {
  const f = courseFeeDisplay(c);
  return f.mode === "indicative" ? `Approx ${f.text}` : f.text;
}

function FeeBandsGuidance() {
  const [bands, setBands] = useState<FeeBand[]>([]);
  const [meta, setMeta] = useState<{ source: string; sourceUrl: string; disclaimer: string } | null>(null);
  useEffect(() => { catalogService.feeBands().then((d) => { setBands(d.bands); setMeta({ source: d.source, sourceUrl: d.sourceUrl, disclaimer: d.disclaimer }); }).catch(() => {}); }, []);
  if (!bands.length) return null;
  return (
    <div className="mt-6 rounded-2xl border border-sand-border bg-sand-card p-5">
      <h2 className="font-display text-lg font-bold text-ink">Indicative international fee bands</h2>
      <p className="mt-0.5 text-xs text-ink-muted">Broad guidance by study level &amp; subject — not exact. Confirm the real fee on the official course page.</p>
      <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {bands.map((b) => (
          <div key={b.key} className="flex justify-between border-b border-sand-border/50 py-1.5 text-sm">
            <span className="text-ink-muted">{b.label}</span>
            <span className="font-medium text-ink">£{b.minGbp.toLocaleString()}–£{b.maxGbp.toLocaleString()}</span>
          </div>
        ))}
      </div>
      {meta && <p className="mt-2 text-[11px] text-ink-muted">Source: {meta.source}. {meta.disclaimer}</p>}
    </div>
  );
}

// ---------------- University detail ----------------
export function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [u, setU] = useState<(CatalogUniversity & { courses: CatalogCourse[]; disclaimer: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) catalogService.university(id).then(setU).catch(() => setU(null)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="py-20 text-center text-ink-muted">Loading…</div>;
  if (!u) return <div className="py-20 text-center text-ink-muted">University not found.</div>;

  const links = [
    ["Official website", u.websiteUrl], ["International office", u.internationalOfficeUrl],
    ["Accommodation", u.accommodationUrl], ["Scholarships", u.scholarshipUrl],
  ].filter(([, url]) => url) as [string, string][];

  const save = async () => {
    try { await studyMatchService.save({ optionType: "university", title: u.universityName, university: u.universityName, city: u.city, officialUrl: u.websiteUrl, status: "shortlisted", sourceUrl: u.sourceUrl }); toast.success("Saved."); }
    catch { toast.error("Couldn't save."); }
  };

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <button onClick={() => navigate(ROUTES.studyMatchUniversities)} className="text-sm text-ink-muted hover:text-ink">← All universities</button>
      <div className="mt-3 rounded-2xl border border-sand-border bg-sand-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-ink">{u.universityName}</h1>
          {u.isRussellGroup && <span className="rounded-md bg-coral/10 px-2 py-0.5 text-xs font-medium text-coral">Russell Group</span>}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted"><MapPin className="h-4 w-4" /> {[u.city, u.region, u.country].filter(Boolean).join(", ")}</p>
        <div className="mt-3"><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${u.ukviSponsorStatus === "licensed" ? "bg-green-100 text-green-700" : "bg-sand text-ink-muted"}`}><ShieldCheck className="h-3.5 w-3.5" /> {SPONSOR_LABEL[u.ukviSponsorStatus]}{u.sponsorRating ? ` · ${u.sponsorRating}` : ""}</span></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-3 py-1.5 text-xs text-ink hover:bg-ink/5"><ExternalLink className="h-3.5 w-3.5" /> {label}</a>
          ))}
          <Button size="sm" variant="ghost" onClick={save}><Bookmark className="mr-1 h-3.5 w-3.5" /> Save</Button>
        </div>
        {u.lastCheckedAt && <p className="mt-3 flex items-center gap-1 text-[11px] text-ink-muted"><BadgeCheck className="h-3 w-3" /> Sponsor status from GOV.UK register · checked {new Date(u.lastCheckedAt).toLocaleDateString()}</p>}
      </div>

      <h2 className="mt-6 flex items-center gap-2 font-display text-lg font-bold"><BookOpen className="h-5 w-5 text-coral" /> Courses ({u.courses.length})</h2>
      {u.courses.length === 0 ? (
        <p className="mt-2 rounded-xl border border-dashed border-sand-border p-6 text-center text-sm text-ink-muted">No course data yet. Course details are added as they're verified — check the official website meanwhile.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {u.courses.map((c) => (
            <button key={c.id} onClick={() => navigate(ROUTES.studyMatchCourseDetail(c.id))} className="flex w-full items-center gap-3 rounded-2xl border border-sand-border bg-sand-card p-4 text-left hover:border-coral/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><h3 className="font-medium text-ink">{c.courseName}</h3><VerifiedBadge course={c} /></div>
                <p className="text-xs text-ink-muted">{[c.degreeLevel, c.duration, feeShort(c)].filter(Boolean).join(" · ")}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-muted" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-ink-muted">{u.disclaimer}</p>
      <FeeBandsGuidance />
    </div>
  );
}

// ---------------- Courses list ----------------
export function CatalogCoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);
  const [subject, setSubject] = useState("");
  const [placement, setPlacement] = useState(false);
  const [data, setData] = useState<{ count: number; results: CatalogCourse[] }>({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean> = { pageSize: 30 };
    if (debounced) params.search = debounced;
    if (subject) params.subjectArea = subject;
    if (placement) params.placement = true;
    catalogService.courses(params).then((r) => setData({ count: r.count, results: r.results })).catch(() => setData({ count: 0, results: [] })).finally(() => setLoading(false));
  }, [debounced, subject, placement]);

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><BookOpen className="h-6 w-6 text-coral" /> Courses</h1>
      <p className="mt-1 text-sm text-ink-muted">Verified course records. Fees show "Check official course page" until confirmed — never guessed.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" className="h-11 w-full rounded-xl border border-sand-border bg-sand-card pl-9 pr-3 text-sm focus-visible:focus-ring" />
        </div>
        <div className="w-full sm:w-56"><Combobox label="" value={subject} onChange={setSubject} options={SUBJECTS} placeholder="All subjects" /></div>
        <button onClick={() => setPlacement((v) => !v)} className={`h-11 rounded-xl border px-3 text-xs ${placement ? "border-coral bg-coral text-white" : "border-sand-border text-ink"}`}>Placement</button>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-sand-border/40" />)}</div>
      ) : data.results.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand-border p-10 text-center text-ink-muted">No course records yet. Courses are added as they're verified (admin/CSV import).</div>
      ) : (
        <div className="mt-4 space-y-2">
          {data.results.map((c) => (
            <button key={c.id} onClick={() => navigate(ROUTES.studyMatchCourseDetail(c.id))} className="flex w-full items-center gap-3 rounded-2xl border border-sand-border bg-sand-card p-4 text-left hover:border-coral/40">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-ink">{c.courseName}</h3><VerifiedBadge course={c} /></div>
                <p className="text-xs text-ink-muted">{c.universityName} · {[c.degreeLevel, c.duration, feeShort(c)].filter(Boolean).join(" · ")}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-muted" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Course detail ----------------
export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [c, setC] = useState<(CatalogCourse & { disclaimer: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) catalogService.course(id).then(setC).catch(() => setC(null)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="py-20 text-center text-ink-muted">Loading…</div>;
  if (!c) return <div className="py-20 text-center text-ink-muted">Course not found.</div>;

  const row = (label: string, value?: string | null) => (
    <div className="flex justify-between gap-3 border-b border-sand-border/60 py-2 text-sm last:border-0">
      <span className="text-ink-muted">{label}</span><span className="text-right font-medium text-ink">{value || "Check official course page"}</span>
    </div>
  );
  const addPlan = async () => {
    try { const r = await studyMatchService.addToPlan([{ title: `Apply — ${c.courseName} (${c.universityName})` }], "university"); toast.success(`Added ${r.created} task to Plan.`); }
    catch { toast.error("Couldn't add to Plan."); }
  };

  return (
    <div className="mx-auto max-w-2xl pb-12">
      <button onClick={() => navigate(-1)} className="text-sm text-ink-muted hover:text-ink">← Back</button>
      <div className="mt-3 rounded-2xl border border-sand-border bg-sand-card p-6">
        <div className="flex flex-wrap items-center gap-2"><h1 className="font-display text-xl font-bold text-ink">{c.courseName}</h1><VerifiedBadge course={c} /></div>
        <p className="mt-1 text-sm text-ink-muted">{c.universityName}</p>
        <div className="mt-4">
          {row("Degree level", c.degreeLevel)}
          {row("Subject area", c.subjectArea)}
          {row("Duration", c.duration)}
          {row("Study mode", c.studyMode)}
          {row("Intake", (c.intakeMonths || []).join(", "))}
          {(() => {
            const f = courseFeeDisplay(c);
            if (f.mode === "verified") return row("International fee", f.text);
            if (f.mode === "indicative") return (
              <div className="border-b border-sand-border/60 py-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-ink-muted">Approx international fee band</span>
                  <span className="text-right font-medium text-ink">{f.text} <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Indicative</span></span>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-muted">{f.band?.label}. Confirm exact fee on the official course page.</p>
              </div>
            );
            return row("International fee", "Check official course page");
          })()}
          {row("IELTS", c.ieltsOverall ? String(c.ieltsOverall) : "")}
          {row("English requirement", c.englishLanguageRequirement)}
          {row("Entry requirements", c.entryRequirements)}
          {row("Placement", c.workPlacementAvailable == null ? "" : c.workPlacementAvailable ? "Available" : "Not available")}
          {row("Scholarships", c.scholarshipInfo)}
        </div>
        {!c.feeVerified && <p className="mt-3 flex items-start gap-1 text-xs text-amber-600"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Fee and details not yet verified — confirm on the official course page.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {c.courseUrl && <a href={c.courseUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-3 py-1.5 text-xs text-ink hover:bg-ink/5"><ExternalLink className="h-3.5 w-3.5" /> Course page</a>}
          {c.applicationUrl && <a href={c.applicationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-3 py-1.5 text-xs text-ink hover:bg-ink/5"><ExternalLink className="h-3.5 w-3.5" /> Apply</a>}
          <Button size="sm" variant="ghost" onClick={addPlan}><CalendarPlus className="mr-1 h-3.5 w-3.5" /> Add to Plan</Button>
        </div>
        {c.lastCheckedAt && <p className="mt-3 text-[11px] text-ink-muted">Last checked {new Date(c.lastCheckedAt).toLocaleDateString()}{c.sourceUrl ? " · source on file" : ""}</p>}
      </div>
      <p className="mt-4 text-xs text-ink-muted">{c.disclaimer}</p>
    </div>
  );
}
