import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, Briefcase, MapPin, BadgeCheck, Bookmark, ExternalLink, CalendarPlus,
  Search, FileText, Users, CheckCircle2, Building2, Lightbulb,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { jobService, type JobFilters } from "@/services/jobService";
import { schedulerService } from "@/services/schedulerService";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/constants";
import { listStagger, popIn } from "@/utils/motion";
import type { Job } from "@/types";

const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "graduate", label: "Graduate scheme" },
];
const EXPERIENCE = [
  { value: "entry", label: "Entry level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
];
const VISA_TIPS = [
  "Check the employer is on the UK's register of licensed sponsors before applying.",
  "Confirm the role meets the salary threshold for a Skilled Worker visa.",
  "Mention your visa status early — many sponsors prefer transparency.",
  "Keep your CV ATS-friendly: clear headings, no tables or images.",
];
const APPLICATION_CHECKLIST = [
  "Tailor your CV to the role's keywords",
  "Write a short, specific cover note",
  "Confirm sponsorship in the job post",
  "Apply via the official link",
  "Add it to your Plan to track follow-ups",
];

export function SponsorshipJobFinderPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, setFilters] = useState<JobFilters>({ visaSponsorship: true });
  const [applied, setApplied] = useState<JobFilters>({ visaSponsorship: true });

  const { data, isLoading, isFetching } = useQuery({ queryKey: ["jobs", applied], queryFn: () => jobService.list(applied) });
  const jobs = data?.results ?? [];
  const { data: sponsors } = useQuery({ queryKey: ["sponsor-companies"], queryFn: () => jobService.sponsorCompanies() });
  const { data: applications = [] } = useQuery({ queryKey: ["applications"], queryFn: schedulerService.applications });

  const savedCount = applications.filter((a) => a.status === "saved").length;
  const appliedCount = applications.filter((a) => a.status === "applied").length;

  const set = (patch: Partial<JobFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: (job: Job) => jobService.save(job.id),
    onSuccess: () => toast.success("Saved to your Plan"),
    onError: (e) => toast.error("Couldn't save: " + (e as Error).message),
  });
  const apply = useMutation({
    mutationFn: (job: Job) => jobService.apply(job.id),
    onSuccess: (res, job) => {
      const url = res?.applyUrl || job.applyUrl;
      if (url) window.open(url, "_blank", "noopener");
      toast.success("Marked as applied in your Plan");
    },
    onError: (e) => toast.error("Couldn't apply: " + (e as Error).message),
  });
  const addToPlan = useMutation({
    mutationFn: (job: Job) => schedulerService.createApplication({
      company: job.company, roleTitle: job.title, jobLink: job.applyUrl, source: "Job board", status: "saved",
    }),
    onSuccess: () => toast.success("Added to your Plan tracker"),
    onError: (e) => toast.error("Couldn't add: " + (e as Error).message),
  });

  const reviewCv = (job: Job) => navigate(`${ROUTES.planCv}?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}`);
  const askReferral = (job: Job) => navigate(`${ROUTES.planReferrals}?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}`);

  return (
    <div className="mx-auto max-w-6xl">
      <button onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl font-bold">Sponsorship Job Finder</h1>
      <p className="text-sm text-ink-muted">Roles from employers that can sponsor UK visas.</p>
      <p className="mb-5 mt-1 text-xs text-ink-muted/80">Kommunitea does not guarantee jobs, interviews, sponsorship, or employment.</p>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Filter sidebar */}
        <Card className="h-fit w-full shrink-0 space-y-3 p-4 lg:w-60">
          <Input label="Role / keyword" placeholder="e.g. data analyst"
            value={filters.search ?? ""} onChange={(e) => set({ search: e.target.value })} />
          <Input label="Location" placeholder="e.g. London"
            value={filters.location ?? ""} onChange={(e) => set({ location: e.target.value })} />
          <Select label="Job type" placeholder="Any" options={JOB_TYPES}
            value={filters.jobType ?? ""} onChange={(e) => set({ jobType: e.target.value })} />
          <Select label="Experience" placeholder="Any" options={EXPERIENCE}
            value={filters.experienceLevel ?? ""} onChange={(e) => set({ experienceLevel: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={filters.visaSponsorship ?? false}
              onChange={(e) => set({ visaSponsorship: e.target.checked })} className="accent-coral" />
            Visa sponsorship only
          </label>
          <Button fullWidth onClick={() => setApplied(filters)} isLoading={isFetching}>
            <Search className="h-4 w-4" /> Search
          </Button>
        </Card>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {isLoading ? <Loader label="Finding roles..." /> : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No matching roles"
              description="Try widening your filters — fewer keywords or turning off the sponsorship-only toggle." />
          ) : (
            <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-3">
              {jobs.map((job) => (
                <motion.div key={job.id} variants={popIn}>
                  <Card className="p-4">
                    <div className="min-w-0">
                      <button onClick={() => navigate(ROUTES.jobDetail(job.id))}
                        className="text-left font-semibold text-ink hover:text-coral hover:underline">{job.title}</button>
                      <p className="text-sm text-ink-soft">{job.company}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>}
                        {job.jobType && <span className="capitalize">{job.jobType.replace("_", " ")}</span>}
                        {job.salaryRange && <span>{job.salaryRange}</span>}
                        {job.visaSponsorship && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600">
                            <BadgeCheck className="h-3 w-3" /> Sponsors visa
                          </span>
                        )}
                      </div>
                    </div>
                    {job.description && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{job.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" isLoading={save.isPending && save.variables?.id === job.id} onClick={() => save.mutate(job)}>
                        <Bookmark className="h-4 w-4" /> Save
                      </Button>
                      <Button size="sm" isLoading={apply.isPending && apply.variables?.id === job.id} onClick={() => apply.mutate(job)} disabled={!job.applyUrl}>
                        <ExternalLink className="h-4 w-4" /> Apply
                      </Button>
                      <Button size="sm" variant="outline" isLoading={addToPlan.isPending && addToPlan.variables?.id === job.id} onClick={() => addToPlan.mutate(job)}>
                        <CalendarPlus className="h-4 w-4" /> Add to Plan
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => reviewCv(job)}><FileText className="h-4 w-4" /> Review CV</Button>
                      <Button size="sm" variant="ghost" onClick={() => askReferral(job)}><Users className="h-4 w-4" /> Ask for referral</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right panel */}
        <aside className="hidden w-72 shrink-0 space-y-4 xl:block">
          <Card className="p-4">
            <p className="mb-2 text-sm font-semibold text-ink-soft">Your applications</p>
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl bg-sand p-3 text-center">
                <p className="text-xl font-bold text-ink">{savedCount}</p><p className="text-xs text-ink-muted">Saved</p>
              </div>
              <div className="flex-1 rounded-xl bg-sand p-3 text-center">
                <p className="text-xl font-bold text-ink">{appliedCount}</p><p className="text-xs text-ink-muted">Applied</p>
              </div>
            </div>
            <button onClick={() => navigate(`${ROUTES.plan}#applications`)} className="mt-2 text-xs font-medium text-coral hover:underline">View tracker →</button>
          </Card>

          {sponsors && sponsors.results.length > 0 && (
            <Card className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Building2 className="h-4 w-4 text-coral" /> Sponsor companies</p>
              <div className="space-y-2">
                {sponsors.results.slice(0, 6).map((c) => (
                  <a key={c.id} href={c.careersUrl || c.linkedinUrl || "#"} target="_blank" rel="noreferrer"
                    className="block rounded-lg p-2 hover:bg-sand">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-ink-muted">{[c.industry, c.country].filter(Boolean).join(" · ")}</p>
                  </a>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-amber-500" /> Visa tips</p>
            <ul className="space-y-1.5 text-xs text-ink-soft">{VISA_TIPS.map((t, i) => <li key={i}>• {t}</li>)}</ul>
            <p className="mt-2 text-[11px] text-ink-muted/80">Visa information is general guidance only. Always check GOV.UK or speak to a qualified immigration adviser.</p>
          </Card>

          <Card className="p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Application checklist</p>
            <ul className="space-y-1.5 text-xs text-ink-soft">{APPLICATION_CHECKLIST.map((t, i) => <li key={i} className="flex gap-1.5"><span className="text-ink-muted">{i + 1}.</span> {t}</li>)}</ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
