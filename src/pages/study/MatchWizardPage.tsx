import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, BadgeCheck, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { catalogService, studyMatchService, MatchedCourse, SM_OPTIONS } from "@/services/studyMatchService";

const CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Sheffield", "Glasgow", "Edinburgh",
  "Newcastle upon Tyne", "Nottingham", "Coventry", "Leicester", "Cardiff", "Bristol", "Liverpool"];
const BUDGETS = [["Under £15,000", 15000], ["Up to £20,000", 20000], ["Up to £25,000", 25000],
  ["Up to £30,000", 30000], ["Up to £40,000", 40000]] as [string, number][];

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-sand-border bg-sand-card px-4 py-3">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex gap-1">
        <button type="button" onClick={() => onChange(true)} className={`rounded-lg px-3 py-1 text-sm ${value ? "bg-coral text-white" : "text-ink-muted hover:bg-ink/5"}`}>Yes</button>
        <button type="button" onClick={() => onChange(false)} className={`rounded-lg px-3 py-1 text-sm ${!value ? "bg-coral text-white" : "text-ink-muted hover:bg-ink/5"}`}>No</button>
      </div>
    </div>
  );
}

export function MatchWizardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [budget, setBudget] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [ielts, setIelts] = useState("");
  const [placement, setPlacement] = useState(false);
  const [scholarship, setScholarship] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<MatchedCourse[] | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const budgetGbp = BUDGETS.find(([label]) => label === budget)?.[1];
      const res = await catalogService.recommendations({
        desiredSubject: subject, budgetGbp, preferredCities: cities,
        ieltsScore: ielts && ielts !== "Not sure" ? ielts.replace("+", "") : undefined,
        wantsPlacement: placement, needsScholarship: scholarship,
      });
      setResults(res.results);
    } catch { toast.error("Couldn't run the match. Please try again."); }
    finally { setBusy(false); }
  };

  const saveCourse = async (c: MatchedCourse) => {
    try { await studyMatchService.save({ optionType: "course", title: c.courseName, university: c.universityName, city: c.city, course: c.courseName, officialUrl: c.courseUrl, status: "shortlisted", matchScore: c.matchPercentage, sourceUrl: c.sourceUrl }); toast.success("Saved course."); }
    catch { toast.error("Couldn't save."); }
  };

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Sparkles className="h-6 w-6 text-coral" /> Find my match</h1>
      <p className="mt-1 text-sm text-ink-muted">We score real courses against your profile — with clear reasons and honest warnings where data isn't confirmed.</p>

      <div className="mt-5 grid gap-4 rounded-2xl border border-sand-border bg-sand-card p-6 sm:grid-cols-2">
        <Combobox label="Subject" value={subject} onChange={setSubject} options={SM_OPTIONS.subject} allowOther placeholder="e.g. Computer Science" />
        <Combobox label="Budget (tuition)" value={budget} onChange={setBudget} options={BUDGETS.map(([l]) => l)} placeholder="Select budget" />
        <div className="sm:col-span-2"><MultiCombobox label="Preferred cities" values={cities} onChange={setCities} options={CITIES} placeholder="Search cities" /></div>
        <Combobox label="IELTS score" value={ielts} onChange={setIelts} options={SM_OPTIONS.scoreByTest.IELTS} placeholder="Select" />
        <div className="space-y-3">
          <YesNo label="Want a placement year" value={placement} onChange={setPlacement} />
          <YesNo label="Need a scholarship" value={scholarship} onChange={setScholarship} />
        </div>
        <div className="sm:col-span-2">
          <Button fullWidth size="lg" onClick={run} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find my match"}</Button>
        </div>
      </div>

      {results !== null && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sand-border p-10 text-center text-ink-muted">
              No matching course records yet. Course data is added as it's verified — meanwhile, browse{" "}
              <button onClick={() => navigate(ROUTES.studyMatchUniversities)} className="text-coral underline">universities</button>.
            </div>
          ) : (
            <>
              <h2 className="mb-3 font-display text-lg font-bold text-ink">{results.length} best-fit course{results.length === 1 ? "" : "s"} to research</h2>
              <div className="space-y-3">
                {results.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-sand-border bg-sand-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display font-semibold text-ink">{c.courseName}</h3>
                          {c.isRussellGroup && <span className="rounded-md bg-coral/10 px-2 py-0.5 text-[11px] font-medium text-coral">Russell Group</span>}
                        </div>
                        <p className="text-sm text-ink-muted">{c.universityName} · {c.city}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-coral/10 px-2.5 py-1 text-sm font-bold text-coral">{c.matchPercentage}/100</span>
                    </div>
                    {c.reasons.map((r, i) => <p key={i} className="mt-1 flex items-start gap-1 text-xs text-green-700"><BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {r}</p>)}
                    {c.warnings.map((w, i) => <p key={i} className="mt-1 flex items-start gap-1 text-xs text-amber-600"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}</p>)}
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => saveCourse(c)}>Save</Button>
                      <button onClick={() => navigate(ROUTES.studyMatchCourseDetail(c.id))} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-coral">View course <ChevronRight className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
