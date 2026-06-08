import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap, Globe2, BookOpen, Building2, MapPin, Wallet,
  FileCheck2, Briefcase, Bookmark, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { studyMatchService } from "@/services/studyMatchService";

const CARDS = [
  { icon: Globe2, title: "Find my best country", desc: "Compare study destinations by your profile.", to: ROUTES.studyMatchCountries },
  { icon: BookOpen, title: "Find my best course", desc: "Match courses to your background and goals.", to: ROUTES.studyMatchCourses },
  { icon: Building2, title: "Compare universities", desc: "Shortlist and compare UK universities.", to: ROUTES.studyMatchUniversities },
  { icon: MapPin, title: "Compare UK cities", desc: "Cost, jobs, lifestyle and community.", to: ROUTES.studyMatchCities },
  { icon: Wallet, title: "Calculate budget", desc: "Understand tuition and living cost bands.", to: ROUTES.studyMatchStart },
  { icon: FileCheck2, title: "Check visa & study steps", desc: "Student & graduate route basics.", to: ROUTES.studyMatchChecklist },
  { icon: Briefcase, title: "Explore job market", desc: "Roles, skills and sponsor visibility.", to: ROUTES.studyMatchCourses },
  { icon: Bookmark, title: "Saved shortlist", desc: "Your saved countries, courses & unis.", to: ROUTES.studyMatchSaved },
];

export function StudyMatchHomePage() {
  const navigate = useNavigate();
  const { data: results } = useQuery({ queryKey: ["study-results"], queryFn: studyMatchService.results });
  const hasResults = (results?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-coral to-coral-dark p-8 text-white shadow-soft sm:p-10">
        <div className="flex items-center gap-2 text-sm font-medium opacity-90">
          <GraduationCap className="h-5 w-5" /> Study Match
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Find the right path for your study abroad journey</h1>
        <p className="mt-2 max-w-2xl text-white/90">
          Discover the best-fit country, course, university, city and career path — explained simply, personalised to you.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" variant="secondary" className="!bg-white !text-coral hover:!bg-white/90"
            onClick={() => navigate(ROUTES.studyMatchStart)}>
            Start Study Match <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button size="lg" variant="ghost" className="!text-white !border !border-white/40 hover:!bg-white/10"
            onClick={() => navigate(ROUTES.studyMatchWizard)}>
            Find my match
          </Button>
          {hasResults && (
            <Button size="lg" variant="ghost" className="!text-white !border !border-white/40 hover:!bg-white/10"
              onClick={() => navigate(ROUTES.studyMatchResult(results![0].id))}>
              View latest match
            </Button>
          )}
          <Button size="lg" variant="ghost" className="!text-white hover:!bg-white/10"
            onClick={() => navigate(ROUTES.studyMatchSaved)}>
            View saved
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ icon: Icon, title, desc, to }) => (
          <button key={title} onClick={() => navigate(to)}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-sand-border bg-sand-card p-5 text-left transition hover:border-coral/40 hover:shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10 text-coral">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display font-semibold text-ink">{title}</h3>
              <p className="mt-0.5 text-sm text-ink-muted">{desc}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-coral opacity-0 transition group-hover:opacity-100">
              Open <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-6 rounded-xl border border-sand-border bg-sand px-4 py-3 text-xs text-ink-muted">
        Study Match provides guidance to help you research options. It does not guarantee admission, visa approval, scholarships or jobs.
      </p>

      {hasResults && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Previous results</h2>
          <div className="space-y-2">
            {results!.slice(0, 6).map((r, i) => (
              <button key={r.id} onClick={() => navigate(ROUTES.studyMatchResult(r.id))}
                className="flex w-full items-center gap-3 rounded-2xl border border-sand-border bg-sand-card p-4 text-left hover:border-coral/40">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral/10 text-coral"><GraduationCap className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{r.overallSummary}</p>
                  <p className="text-xs text-ink-muted">{i === 0 ? "Latest · " : ""}{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
