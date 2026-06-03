import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, FileText, Briefcase, Wand2, Check, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { aiService } from "@/services/aiService";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import { springy } from "@/utils/motion";

type Tab = "profile" | "cv" | "jobs";

export function AIToolsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const tabs: { id: Tab; label: string; icon: typeof Sparkles }[] = [
    { id: "profile", label: "Profile Builder", icon: Wand2 },
    { id: "cv", label: "CV Review", icon: FileText },
    { id: "jobs", label: "Job Matching", icon: Briefcase },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={springy}
        className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E1E2D] text-coral">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">AI Tools</h1>
          <p className="text-sm text-ink-muted">Your personal career assistant.</p>
        </div>
      </motion.div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              tab === t.id ? "border-coral bg-coral text-white shadow-soft" : "border-sand-border bg-sand-card text-ink-soft hover:border-coral")}>
            <t.icon className="h-4 w-4" /> <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          {tab === "profile" && <ProfileBuilder />}
          {tab === "cv" && <CVReview />}
          {tab === "jobs" && <JobMatching />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AIBadge({ powered }: { powered: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
      powered ? "bg-[#1E1E2D] text-coral" : "bg-sand text-ink-muted")}>
      <Sparkles className="h-3 w-3" /> {powered ? "AI powered" : "Smart suggestions"}
    </span>
  );
}

function ProfileBuilder() {
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const build = useMutation({ mutationFn: () => aiService.buildProfile() });
  const save = useMutation({
    mutationFn: (bio: string) => profileService.update({ bio }),
    onSuccess: (u) => { setUser(u); toast.success("Saved to your profile ✨"); },
  });

  return (
    <Card className="space-y-4 p-5">
      <p className="text-sm text-ink-soft">
        Generate a polished bio from your profile details ({user?.course || "your course"}, skills, and goals).
      </p>
      <Button onClick={() => build.mutate()} isLoading={build.isPending}>
        <Wand2 className="h-4 w-4" /> Generate my bio
      </Button>
      {build.data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 rounded-xl bg-sand p-4">
          <div className="flex items-center justify-between">
            {build.data.headline && <p className="font-semibold">{build.data.headline}</p>}
            <AIBadge powered={build.data.aiPowered} />
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">{build.data.bio}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => save.mutate(build.data!.bio)} isLoading={save.isPending}>
              <Check className="h-4 w-4" /> Use this bio
            </Button>
            <Button size="sm" variant="ghost" onClick={() => build.mutate()}>Regenerate</Button>
          </div>
        </motion.div>
      )}
    </Card>
  );
}

function CVReview() {
  const [text, setText] = useState("");
  const review = useMutation({ mutationFn: () => aiService.reviewCV(text) });
  const r = review.data;

  return (
    <Card className="space-y-4 p-5">
      <p className="text-sm text-ink-soft">Paste your CV text and get instant, structured feedback.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7}
        placeholder="Paste your CV here..."
        className="w-full rounded-xl border border-sand-border bg-sand-card p-3 text-sm focus-visible:focus-ring" />
      <Button onClick={() => review.mutate()} isLoading={review.isPending} disabled={text.trim().length < 40}>
        <FileText className="h-4 w-4" /> Review my CV
      </Button>
      {r && !r.error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            {r.summary && <p className="text-sm font-medium">{r.summary}</p>}
            <AIBadge powered={r.aiPowered} />
          </div>
          <Section title="✅ Strengths" items={r.strengths} tone="green" />
          <Section title="🛠 Improvements" items={r.improvements} tone="coral" />
          <Section title="🤖 ATS tips" items={r.atsTips} tone="sky" />
        </motion.div>
      )}
      {r?.error && <p className="text-sm text-coral">{r.error}</p>}
    </Card>
  );
}

function Section({ title, items, tone }: { title: string; items: string[]; tone: "green" | "coral" | "sky" }) {
  if (!items?.length) return null;
  const bg = { green: "bg-emerald-50", coral: "bg-coral/5", sky: "bg-sky-soft" }[tone];
  return (
    <div className={cn("rounded-xl p-3", bg)}>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => <li key={i} className="text-sm text-ink-soft">• {it}</li>)}
      </ul>
    </div>
  );
}

function JobMatching() {
  const match = useMutation({ mutationFn: () => aiService.matchJobs() });
  const r = match.data;

  return (
    <Card className="space-y-4 p-5">
      <p className="text-sm text-ink-soft">Find jobs that fit your skills, interests and goals.</p>
      <Button onClick={() => match.mutate()} isLoading={match.isPending}>
        <Briefcase className="h-4 w-4" /> Find my matches
      </Button>
      {match.isPending && <div className="flex items-center gap-2 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin" /> Matching...</div>}
      {r && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-end"><AIBadge powered={r.aiPowered} /></div>
          {r.note && <p className="rounded-xl bg-sand p-3 text-sm text-ink-muted">{r.note}</p>}
          {r.matches.map((m) => (
            <div key={m.id} className="rounded-xl border border-sand-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.job?.title ?? `Job #${m.id}`}</p>
                  <p className="text-xs text-ink-muted">{m.job?.company} · {m.job?.location}</p>
                </div>
                {m.score > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{m.score}% match</span>
                )}
              </div>
              <p className="mt-2 text-sm text-ink-soft">{m.reason}</p>
              {m.job?.applyUrl && (
                <a href={m.job.applyUrl} target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-coral hover:underline">
                  Apply <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </Card>
  );
}
