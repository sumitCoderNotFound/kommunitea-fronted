import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, FileText, Check, X, AlertTriangle, Target, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cvService } from "@/services/cvService";
import { useToast } from "@/hooks/useToast";
import { timeAgo } from "@/utils/format";
import type { CVAnalysis } from "@/types";

export function CVReviewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const jobContext = params.get("company") || params.get("role")
    ? { company: params.get("company") ?? "", role: params.get("role") ?? "" }
    : null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<CVAnalysis | null>(null);

  const { data: history } = useQuery({ queryKey: ["cv-history"], queryFn: cvService.list });

  const analyze = useMutation({
    mutationFn: () => cvService.analyze(file!, jd.trim() || undefined),
    onSuccess: (r) => {
      setReport(r);
      qc.invalidateQueries({ queryKey: ["cv-history"] });
      toast.success("CV analysed");
    },
    onError: (e) => toast.error("Analysis failed: " + (e as Error).message),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl font-bold">CV ATS Review</h1>
      <p className="text-sm text-ink-muted">Upload your CV to see how applicant-tracking systems read it.</p>
      <p className="mb-5 mt-1 text-xs text-ink-muted/80">CV analysis is guidance only and does not guarantee interview selection.</p>

      {jobContext && (
        <div className="mb-4 rounded-xl border border-coral/30 bg-coral/5 px-4 py-3 text-sm text-ink-soft">
          Reviewing for <span className="font-semibold">{jobContext.role || "this role"}</span>
          {jobContext.company ? <> at <span className="font-semibold">{jobContext.company}</span></> : null}. Paste the job description below for a job-match score.
        </div>
      )}

      <Card className="space-y-4 p-5">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sand-border py-8 text-center hover:border-coral"
        >
          <Upload className="h-7 w-7 text-ink-muted" />
          <span className="text-sm font-medium">{file ? file.name : "Choose a PDF or DOCX file"}</span>
          <span className="text-xs text-ink-muted">Max ~5MB</span>
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <Textarea label="Job description (optional)" placeholder="Paste a job description to also get a job-match score..."
          value={jd} onChange={(e) => setJd(e.target.value)} />

        <Button fullWidth disabled={!file} isLoading={analyze.isPending} onClick={() => analyze.mutate()}>
          <FileText className="h-4 w-4" /> Analyse CV
        </Button>
      </Card>

      {analyze.isPending && <div className="mt-6"><Loader label="Scoring your CV..." /></div>}

      {report && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreCard label="ATS Readiness" score={report.atsScore} icon={Sparkles} />
            {typeof report.jobMatchScore === "number" && (
              <ScoreCard label="Job Match" score={report.jobMatchScore} icon={Target} />
            )}
          </div>

          {report.summary && <Card className="p-4 text-sm text-ink-soft">{report.summary}</Card>}

          {!!report.topFixes?.length && (
            <Card className="p-4">
              <p className="mb-2 font-semibold">Top fixes</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-soft">
                {report.topFixes.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
              </ol>
            </Card>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <CheckList title="Passed" items={report.passedChecks} icon={Check} tone="text-emerald-600" />
            <CheckList title="Needs work" items={report.improvementChecks} icon={AlertTriangle} tone="text-amber-600" />
            <CheckList title="Failed" items={report.failedChecks} icon={X} tone="text-rose-500" />
          </div>

          {!!report.missingKeywords?.length && (
            <Card className="p-4">
              <p className="mb-2 font-semibold">Missing keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {report.missingKeywords.map((k) => (
                  <span key={k} className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-500">{k}</span>
                ))}
              </div>
            </Card>
          )}

          {!!report.recommendedRoles?.length && (
            <Card className="p-4">
              <p className="mb-2 font-semibold">Recommended roles</p>
              <div className="flex flex-wrap gap-1.5">
                {report.recommendedRoles.map((r) => (
                  <span key={r} className="rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-medium text-coral">{r}</span>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Past reports */}
      {!report && history && history.results.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-ink-soft">Past reports</p>
          <Card className="divide-y divide-sand-border p-0">
            {history.results.map((r) => (
              <button key={r.id} onClick={() => setReport(r)} className="flex w-full items-center justify-between p-3 text-left hover:bg-sand">
                <span className="truncate text-sm">{r.fileName}</span>
                <span className="flex items-center gap-3 text-xs text-ink-muted">
                  ATS {r.atsScore} · {timeAgo(r.createdAt)}
                </span>
              </button>
            ))}
          </Card>
        </div>
      )}

      {!report && history && history.results.length === 0 && !analyze.isPending && (
        <div className="mt-6">
          <EmptyState icon={FileText} title="No reports yet" description="Upload a CV above to get your first ATS score." />
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, score, icon: Icon }: { label: string; score: number; icon: typeof Target }) {
  const tone = score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-500";
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-sand text-xl font-bold ${tone}`}>
        {score}
      </div>
      <div>
        <p className="flex items-center gap-1 text-sm font-semibold"><Icon className="h-4 w-4 text-coral" /> {label}</p>
        <p className="text-xs text-ink-muted">out of 100</p>
      </div>
    </Card>
  );
}

function CheckList({ title, items, icon: Icon, tone }: { title: string; items?: string[]; icon: typeof Check; tone: string }) {
  return (
    <Card className="p-4">
      <p className={`mb-2 flex items-center gap-1 text-sm font-semibold ${tone}`}><Icon className="h-4 w-4" /> {title}</p>
      {items && items.length > 0 ? (
        <ul className="space-y-1 text-xs text-ink-soft">{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
      ) : <p className="text-xs text-ink-muted">—</p>}
    </Card>
  );
}
