import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, MessageCircleQuestion, CalendarDays, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { interviewPrepService } from "@/services/interviewPrepService";
import { useToast } from "@/hooks/useToast";
import { listStagger, popIn } from "@/utils/motion";
import type { InterviewPrep } from "@/types";

const DEFAULT_CHECKLIST = [
  "Research the company and its products",
  "Re-read the job description and match your examples",
  "Prepare 3 STAR stories (Situation, Task, Action, Result)",
  "Prepare questions to ask the interviewer",
  "Test your tech / plan your route",
].map((text) => ({ text, done: false }));

const COMMON_QUESTIONS = [
  "Tell me about yourself.",
  "Why do you want this role?",
  "Describe a challenge you overcame.",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in 5 years?",
];

export function InterviewPrepPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<InterviewPrep>>({});

  useEffect(() => {
    const company = params.get("company");
    const role = params.get("role");
    if (company || role) {
      setForm({ company: company ?? "", roleTitle: role ?? "" });
      setOpen(true);
    }
  }, [params]);

  const { data, isLoading } = useQuery({ queryKey: ["interview-prep"], queryFn: interviewPrepService.list });
  const preps = data?.results ?? [];

  const create = useMutation({
    mutationFn: () => interviewPrepService.create({
      ...form,
      checklist: DEFAULT_CHECKLIST,
      questions: COMMON_QUESTIONS,
      confidenceScore: 0,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["interview-prep"] }); setOpen(false); setForm({}); toast.success("Interview prep created"); },
    onError: (e) => toast.error("Couldn't create: " + (e as Error).message),
  });

  const toggle = useMutation({
    mutationFn: ({ prep, index }: { prep: InterviewPrep; index: number }) => {
      const checklist = (prep.checklist ?? []).map((c, i) => i === index ? { ...c, done: !c.done } : c);
      const done = checklist.filter((c) => c.done).length;
      const confidenceScore = checklist.length ? Math.round((done / checklist.length) * 100) : 0;
      return interviewPrepService.update(prep.id, { checklist, confidenceScore });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interview-prep"] }),
    onError: (e) => toast.error("Couldn't update: " + (e as Error).message),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Interview Prep</h1>
          <p className="text-sm text-ink-muted">Get ready, one checklist at a time.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {isLoading ? <Loader /> : preps.length === 0 ? (
        <EmptyState icon={MessageCircleQuestion} title="No interviews tracked yet"
          description="Add an upcoming interview to get a prep checklist and common questions."
          action={<Button onClick={() => setOpen(true)}>Add an interview</Button>} />
      ) : (
        <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-3">
          {preps.map((p) => (
            <motion.div key={p.id} variants={popIn}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.roleTitle || "Role"} <span className="font-normal text-ink-muted">@ {p.company}</span></p>
                    {p.interviewDate && (
                      <p className="flex items-center gap-1 text-xs text-coral">
                        <CalendarDays className="h-3 w-3" /> {new Date(p.interviewDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-coral">{p.confidenceScore ?? 0}%</p>
                    <p className="text-[10px] uppercase tracking-wide text-ink-muted">ready</p>
                  </div>
                </div>

                {!!p.checklist?.length && (
                  <div className="mt-3 space-y-1.5">
                    {p.checklist.map((item, i) => (
                      <button key={i} onClick={() => toggle.mutate({ prep: p, index: i })}
                        className="flex w-full items-center gap-2 text-left text-sm">
                        {item.done
                          ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          : <Circle className="h-4 w-4 shrink-0 text-ink-muted" />}
                        <span className={item.done ? "text-ink-muted line-through" : "text-ink-soft"}>{item.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {!!p.questions?.length && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-ink-soft">Common questions</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                      {p.questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </details>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add interview">
        <div className="space-y-3">
          <Input label="Company" value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input label="Role title" value={form.roleTitle ?? ""} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
          <Input label="Interview date & time" type="datetime-local"
            value={form.interviewDate ?? ""} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} />
          <Textarea label="Notes" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button fullWidth disabled={!form.company} isLoading={create.isPending} onClick={() => create.mutate()}>
            Create with checklist
          </Button>
        </div>
      </Modal>
    </div>
  );
}
