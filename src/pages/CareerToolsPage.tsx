import { BadgeCheck, FileText, Users, MessageCircleQuestion, ClipboardList } from "lucide-react";
import { CareerToolCard } from "@/features/plan/CareerToolCard";
import { ROUTES } from "@/constants";

export function CareerToolsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold">Career Tools</h1>
      <p className="mb-5 text-sm text-ink-muted">Everything to land your next UK role — in one place.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <CareerToolCard to={ROUTES.planSponsorship} icon={BadgeCheck} title="Sponsorship Job Finder"
          description="Find roles from visa-sponsoring employers." accent="bg-emerald-500/10 text-emerald-600" />
        <CareerToolCard to={ROUTES.planCv} icon={FileText} title="CV ATS Review"
          description="Score your CV against applicant-tracking systems." accent="bg-sky-500/10 text-sky-500" />
        <CareerToolCard to={ROUTES.planReferrals} icon={Users} title="Referral Tracker"
          description="Track who you've asked for referrals." accent="bg-violet-500/10 text-violet-500" />
        <CareerToolCard to={ROUTES.planInterview} icon={MessageCircleQuestion} title="Interview Prep"
          description="Checklists and common questions per interview." accent="bg-amber-500/10 text-amber-600" />
        <CareerToolCard to={`${ROUTES.plan}#applications`} icon={ClipboardList} title="Application Tracker"
          description="Every saved & applied job, with status." accent="bg-coral/10 text-coral" />
      </div>
    </div>
  );
}
