import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, BadgeCheck, Bookmark, ExternalLink, CalendarPlus, Briefcase, FileText, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { jobService } from "@/services/jobService";
import { schedulerService } from "@/services/schedulerService";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/constants";

export function JobDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobService.get(id),
    enabled: !!id,
  });

  const save = useMutation({
    mutationFn: () => jobService.save(id),
    onSuccess: () => toast.success("Saved to your Plan"),
    onError: (e) => toast.error("Couldn't save: " + (e as Error).message),
  });
  const apply = useMutation({
    mutationFn: () => jobService.apply(id),
    onSuccess: (res) => {
      const url = res?.applyUrl || job?.applyUrl;
      if (url) window.open(url, "_blank", "noopener");
      toast.success("Marked as applied in your Plan");
    },
    onError: (e) => toast.error("Couldn't apply: " + (e as Error).message),
  });
  const addToPlan = useMutation({
    mutationFn: () => schedulerService.createApplication({
      company: job!.company, roleTitle: job!.title, jobLink: job!.applyUrl, source: "Job board", status: "saved",
    }),
    onSuccess: () => toast.success("Added to your Plan tracker"),
    onError: (e) => toast.error("Couldn't add: " + (e as Error).message),
  });

  if (isLoading) return <Loader label="Loading job..." />;
  if (isError || !job) {
    return <EmptyState icon={Briefcase} title="Job not available"
      description="This role may have been removed or is no longer active." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          <h1 className="font-display text-2xl font-bold">{job.title}</h1>
          <p className="text-ink-soft">{job.company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>}
            {job.jobType && <span className="capitalize">{job.jobType.replace("_", " ")}</span>}
            {job.experienceLevel && <span className="capitalize">{job.experienceLevel}</span>}
            {job.salaryRange && <span>{job.salaryRange}</span>}
            {job.visaSponsorship && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600">
                <BadgeCheck className="h-3.5 w-3.5" /> Sponsors visa
              </span>
            )}
          </div>

          {!!job.skills?.length && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <span key={s} className="rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-medium text-sky">{s}</span>
              ))}
            </div>
          )}

          {job.description && (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{job.description}</div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" isLoading={save.isPending} onClick={() => save.mutate()}>
              <Bookmark className="h-4 w-4" /> Save
            </Button>
            <Button isLoading={apply.isPending} onClick={() => apply.mutate()} disabled={!job.applyUrl}>
              <ExternalLink className="h-4 w-4" /> Apply
            </Button>
            <Button variant="outline" isLoading={addToPlan.isPending} onClick={() => addToPlan.mutate()}>
              <CalendarPlus className="h-4 w-4" /> Add to Plan
            </Button>
            <Button variant="ghost" onClick={() => navigate(`${ROUTES.planCv}?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}`)}>
              <FileText className="h-4 w-4" /> Review CV
            </Button>
            <Button variant="ghost" onClick={() => navigate(`${ROUTES.planReferrals}?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}`)}>
              <Users className="h-4 w-4" /> Ask for referral
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-muted/80">Kommunitea does not guarantee jobs, interviews, sponsorship, or employment.</p>
        </Card>
      </motion.div>
    </div>
  );
}
