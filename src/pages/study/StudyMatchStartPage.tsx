import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { studyMatchService, StudyProfile, PRIORITY_OPTIONS, SM_OPTIONS } from "@/services/studyMatchService";

const STEPS = ["About you", "Study goal", "Budget", "English & docs", "Priorities"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${active ? "border-coral bg-coral text-white" : "border-sand-border bg-sand-card text-ink hover:border-coral/40"}`}>
      {children}
    </button>
  );
}

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

export function StudyMatchStartPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState<StudyProfile>({ preferredCountries: [], priorities: [] });
  const [documents, setDocuments] = useState<string[]>([]);
  const [resume, setResume] = useState<{ hasProfile: boolean; latestId?: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [profile, results] = await Promise.all([studyMatchService.getProfile(), studyMatchService.results()]);
        const hasProfile = !!profile && Object.values(profile).some((v) => (Array.isArray(v) ? v.length : v));
        if (hasProfile || results.length) {
          setResume({ hasProfile, latestId: results[0]?.id });
          if (hasProfile) setP({ preferredCountries: [], priorities: [], ...profile });
        }
      } catch { /* no profile yet */ }
    })();
  }, []);

  const set = (patch: Partial<StudyProfile>) => setP((prev) => ({ ...prev, ...patch }));

  const saveLater = async () => {
    try { await studyMatchService.saveProfile(p); toast.success("Saved — you can continue later."); }
    catch { toast.error("Couldn't save right now."); }
  };

  const generate = async () => {
    setBusy(true);
    try {
      const payload: StudyProfile = { ...p, documentStatus: documents.length > 0 && !documents.includes("Not ready yet") };
      const result = await studyMatchService.generate(payload);
      navigate(ROUTES.studyMatchResult(result.id), { replace: true });
    } catch { toast.error("Couldn't generate your match. Please try again."); setBusy(false); }
  };

  const next = () => (step === 4 ? generate() : setStep((s) => Math.min(5, s + 1)));
  const scoreOptions = SM_OPTIONS.scoreByTest[p.englishTestType || ""] || ["Not sure"];

  return (
    <div className="mx-auto max-w-2xl">
      {resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-sand-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold text-ink">You already have a Study Match</h2>
            <p className="mt-1 text-sm text-ink-muted">Pick up where you left off, or start fresh.</p>
            <div className="mt-5 space-y-2">
              {resume.hasProfile && <Button fullWidth onClick={() => setResume(null)}>Continue saved answers</Button>}
              {resume.latestId && <Button fullWidth variant="secondary" onClick={() => navigate(ROUTES.studyMatchResult(resume.latestId!))}>View latest result</Button>}
              <Button fullWidth variant="ghost" onClick={() => { setP({ preferredCountries: [], priorities: [] }); setDocuments([]); setStep(0); setResume(null); }}>
                Start new Study Match
              </Button>
            </div>
            <p className="mt-3 text-xs text-ink-muted">Starting new keeps your previous results in history.</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">{STEPS[step]}</span>
          <span className="text-ink-muted">Step {step + 1} of 5</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sand-border">
          <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${((step + 1) / 5) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-sand-border bg-sand-card p-6">
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">Tell us a bit about you — just pick from the lists.</p>
            <Combobox label="Current country" value={p.currentCountry || ""} onChange={(v) => set({ currentCountry: v })} options={SM_OPTIONS.currentCountry} allowOther placeholder="Select country" />
            <Combobox label="Current education level" value={p.educationLevel || ""} onChange={(v) => set({ educationLevel: v })} options={SM_OPTIONS.educationLevel} placeholder="Select level" />
            <Combobox label="Current qualification" value={p.currentQualification || ""} onChange={(v) => set({ currentQualification: v })} options={SM_OPTIONS.qualification} allowOther placeholder="Select qualification" />
            <Combobox label="Marks / CGPA" value={p.marksOrCgpa || ""} onChange={(v) => set({ marksOrCgpa: v })} options={SM_OPTIONS.marks} placeholder="Select range" />
            <Combobox label="Work experience" value={p.workExperience || ""} onChange={(v) => set({ workExperience: v })} options={SM_OPTIONS.workExperience} placeholder="Select" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Desired study level</label>
              <div className="flex flex-wrap gap-2">
                {SM_OPTIONS.studyLevel.map((l) => <Chip key={l} active={p.desiredStudyLevel === l} onClick={() => set({ desiredStudyLevel: l })}>{l}</Chip>)}
              </div>
            </div>
            <Combobox label="Subject interest" value={p.subjectInterest || ""} onChange={(v) => set({ subjectInterest: v })} options={SM_OPTIONS.subject} allowOther placeholder="Select subject" />
            <Combobox label="Career goal" value={p.careerGoal || ""} onChange={(v) => set({ careerGoal: v })} options={SM_OPTIONS.careerGoal} allowOther placeholder="Select career goal" />
            <Combobox label="Preferred intake" value={p.preferredIntake || ""} onChange={(v) => set({ preferredIntake: v })} options={SM_OPTIONS.intake} placeholder="Select intake" />
            <MultiCombobox label="Preferred countries" values={p.preferredCountries || []} onChange={(v) => set({ preferredCountries: v })} options={SM_OPTIONS.countries} placeholder="Search countries" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Combobox label="Tuition budget" value={p.tuitionBudget || ""} onChange={(v) => set({ tuitionBudget: v })} options={SM_OPTIONS.tuitionBudget} placeholder="Select tuition budget" />
            <Combobox label="Living cost budget" value={p.livingBudget || ""} onChange={(v) => set({ livingBudget: v })} options={SM_OPTIONS.livingBudget} placeholder="Select living budget" />
            <YesNo label="I need a scholarship" value={!!p.needsScholarship} onChange={(v) => set({ needsScholarship: v })} />
            <YesNo label="I want part-time work" value={!!p.needsPartTimeWork} onChange={(v) => set({ needsPartTimeWork: v })} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">English test</label>
              <div className="flex flex-wrap gap-2">
                {SM_OPTIONS.englishTest.map((t) => <Chip key={t} active={p.englishTestType === t} onClick={() => set({ englishTestType: t, englishTestScore: "" })}>{t}</Chip>)}
              </div>
            </div>
            {["IELTS", "PTE", "TOEFL", "Duolingo"].includes(p.englishTestType || "") && (
              <Combobox label="Score" value={p.englishTestScore || ""} onChange={(v) => set({ englishTestScore: v })} options={scoreOptions} placeholder="Select score" />
            )}
            <YesNo label="I have a passport" value={!!p.passportStatus} onChange={(v) => set({ passportStatus: v })} />
            <MultiCombobox label="Documents ready" values={documents} onChange={setDocuments} options={SM_OPTIONS.documents} placeholder="Add documents you have" />
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="mb-3 text-sm text-ink-muted">What matters most to you? Pick any that apply.</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((o) => (
                <Chip key={o.key} active={(p.priorities || []).includes(o.key)}
                  onClick={() => set({ priorities: (p.priorities || []).includes(o.key) ? (p.priorities || []).filter((x) => x !== o.key) : [...(p.priorities || []), o.key] })}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => (step === 0 ? navigate(ROUTES.studyMatch) : setStep((s) => s - 1))}
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={saveLater} className="text-sm font-medium text-ink-muted hover:text-ink">Save for later</button>
            <Button onClick={next} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 4 ? "Generate my match" : <>Next <ArrowRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
