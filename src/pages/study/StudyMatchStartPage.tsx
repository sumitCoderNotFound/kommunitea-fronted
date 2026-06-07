import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants";
import { useToast } from "@/hooks/useToast";
import { studyMatchService, StudyProfile, PRIORITY_OPTIONS } from "@/services/studyMatchService";

const COUNTRIES = ["UK", "Canada", "Germany", "Australia", "Ireland", "USA", "New Zealand"];
const STEPS = ["About you", "Study goal", "Budget", "English & docs", "Priorities", "Result"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${active ? "border-coral bg-coral text-white" : "border-sand-border bg-sand-card text-ink hover:border-coral/40"}`}>
      {children}
    </button>
  );
}

export function StudyMatchStartPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState<StudyProfile>({ preferredCountries: [], priorities: [] });

  const set = (patch: Partial<StudyProfile>) => setP((prev) => ({ ...prev, ...patch }));
  const toggle = (key: "preferredCountries" | "priorities", val: string) =>
    setP((prev) => {
      const arr = prev[key] || [];
      return { ...prev, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });

  const saveLater = async () => {
    try { await studyMatchService.saveProfile(p); toast.success("Saved — you can continue later."); }
    catch { toast.error("Couldn't save right now."); }
  };

  const generate = async () => {
    setBusy(true);
    try {
      const result = await studyMatchService.generate(p);
      navigate(ROUTES.studyMatchResult(result.id), { replace: true });
    } catch {
      toast.error("Couldn't generate your match. Please try again.");
      setBusy(false);
    }
  };

  const next = () => (step === 4 ? generate() : setStep((s) => Math.min(5, s + 1)));

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
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
            <p className="text-sm text-ink-muted">Tell us a bit about you. Skip anything you're unsure about.</p>
            <Input label="Current country" placeholder="e.g. India" value={p.currentCountry || ""} onChange={(e) => set({ currentCountry: e.target.value })} />
            <Input label="Current education level" placeholder="e.g. Bachelor's" value={p.educationLevel || ""} onChange={(e) => set({ educationLevel: e.target.value })} />
            <Input label="Current qualification" placeholder="e.g. BTech Computer Science" value={p.currentQualification || ""} onChange={(e) => set({ currentQualification: e.target.value })} />
            <Input label="Marks / CGPA (optional)" placeholder="e.g. 8.2 CGPA" value={p.marksOrCgpa || ""} onChange={(e) => set({ marksOrCgpa: e.target.value })} />
            <Input label="Work experience (optional)" placeholder="e.g. 1 year" value={p.workExperience || ""} onChange={(e) => set({ workExperience: e.target.value })} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Desired study level</label>
              <div className="flex flex-wrap gap-2">
                {["Undergraduate", "Masters", "PhD", "Diploma"].map((l) => (
                  <Chip key={l} active={p.desiredStudyLevel === l} onClick={() => set({ desiredStudyLevel: l })}>{l}</Chip>
                ))}
              </div>
            </div>
            <Input label="Subject interest" placeholder="e.g. Computer Science" value={p.subjectInterest || ""} onChange={(e) => set({ subjectInterest: e.target.value })} />
            <Input label="Career goal" placeholder="e.g. Software Engineer" value={p.careerGoal || ""} onChange={(e) => set({ careerGoal: e.target.value })} />
            <Input label="Preferred intake (optional)" placeholder="e.g. Sep 2026" value={p.preferredIntake || ""} onChange={(e) => set({ preferredIntake: e.target.value })} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Preferred countries (optional)</label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <Chip key={c} active={(p.preferredCountries || []).includes(c)} onClick={() => toggle("preferredCountries", c)}>{c}</Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Input label="Tuition budget (optional)" placeholder="e.g. £15,000/year" value={p.tuitionBudget || ""} onChange={(e) => set({ tuitionBudget: e.target.value })} />
            <Input label="Living cost budget (optional)" placeholder="e.g. £900/month" value={p.livingBudget || ""} onChange={(e) => set({ livingBudget: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={!!p.needsScholarship} onChange={(e) => set({ needsScholarship: e.target.checked })} /> I need a scholarship
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={!!p.needsPartTimeWork} onChange={(e) => set({ needsPartTimeWork: e.target.checked })} /> I want part-time work
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">English test</label>
              <div className="flex flex-wrap gap-2">
                {["IELTS", "PTE", "TOEFL", "Not taken yet"].map((t) => (
                  <Chip key={t} active={p.englishTestType === t} onClick={() => set({ englishTestType: t })}>{t}</Chip>
                ))}
              </div>
            </div>
            <Input label="Score if available (optional)" placeholder="e.g. 7.0" value={p.englishTestScore || ""} onChange={(e) => set({ englishTestScore: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={!!p.passportStatus} onChange={(e) => set({ passportStatus: e.target.checked })} /> I have a passport
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={!!p.documentStatus} onChange={(e) => set({ documentStatus: e.target.checked })} /> My documents are ready
            </label>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="mb-3 text-sm text-ink-muted">What matters most to you? Pick any that apply.</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((o) => (
                <Chip key={o.key} active={(p.priorities || []).includes(o.key)} onClick={() => toggle("priorities", o.key)}>{o.label}</Chip>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
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
