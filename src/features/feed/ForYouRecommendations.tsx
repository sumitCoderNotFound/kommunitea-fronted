import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sparkles, X, Plus, Bookmark, MapPin, Briefcase, Target, FileText, User, Compass, ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/features/profile/FollowButton";
import { useRecommendations } from "@/hooks/useRecommendations";
import { communityService } from "@/services/communityService";
import { jobService } from "@/services/jobService";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/constants";
import type { RecAction } from "@/services/recommendationService";

const ACTION_ICON = { briefcase: Briefcase, target: Target, file: FileText, user: User, compass: Compass, sparkles: Sparkles };

export function ForYouRecommendations() {
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { communities, people, jobs, actions, hide, boostPeopleByUniversity, boostCommunitiesByCategory } = useRecommendations();

  const join = useMutation({
    mutationFn: (id: string) => communityService.join(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rec-communities"] }); qc.invalidateQueries({ queryKey: ["communities"] }); toast.success("Joined community"); },
    onError: (e) => toast.error("Couldn't join: " + (e as Error).message),
  });
  const saveJob = useMutation({
    mutationFn: (id: string) => jobService.save(id),
    onSuccess: () => toast.success("Saved to your Plan"),
    onError: (e) => toast.error("Couldn't save: " + (e as Error).message),
  });

  const nothing = actions.length === 0 && communities.length === 0 && people.length === 0 && jobs.length === 0;
  if (nothing) return null;

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-coral" />
        <h2 className="font-display font-semibold">For you</h2>
      </div>

      {/* Suggested next actions */}
      {actions.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {actions.map((a: RecAction) => {
            const Icon = ACTION_ICON[a.icon];
            return (
              <button key={a.key} onClick={() => navigate(a.to)}
                className="flex flex-col gap-1 rounded-xl border border-sand-border bg-sand-card p-3 text-left transition-colors hover:border-coral">
                <Icon className="h-4 w-4 text-coral" />
                <span className="text-sm font-semibold">{a.title}</span>
                <span className="text-xs text-ink-muted">{a.desc}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Communities for you */}
      {communities.length > 0 && (
        <Section title="Communities for you">
          {communities.map((c) => (
            <RecChip key={c.id} onHide={() => hide("communities", String(c.id))} onMore={() => boostCommunitiesByCategory(c.category)}>
              <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3" onClick={() => navigate(ROUTES.communityDetail(String(c.id)))}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-sm font-bold text-coral">{c.name.charAt(0)}</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-ink-muted capitalize">{c.category} · {c.membersCount} members</p>
                </div>
              </div>
              <Button size="sm" variant="outline" isLoading={join.isPending && join.variables === String(c.id)} onClick={() => join.mutate(String(c.id))}>
                <Plus className="h-4 w-4" /> Join
              </Button>
            </RecChip>
          ))}
        </Section>
      )}

      {/* People for you */}
      {people.length > 0 && (
        <Section title="People for you">
          {people.map((p) => (
            <RecChip key={p.id} onHide={() => hide("people", String(p.id))} onMore={p.university ? () => boostPeopleByUniversity(p.university) : undefined}>
              <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3" onClick={() => navigate(ROUTES.profile(p.id))}>
                <Avatar name={p.fullName} src={p.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.fullName}</p>
                  <p className="truncate text-xs text-ink-muted">{p.university || p.city || p.userType}</p>
                </div>
              </div>
              <FollowButton user={p} />
            </RecChip>
          ))}
        </Section>
      )}

      {/* Jobs for you */}
      {jobs.length > 0 && (
        <Section title="Jobs for you">
          {jobs.map((j) => (
            <RecChip key={j.id} onHide={() => hide("jobs", String(j.id))}>
              <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3" onClick={() => navigate(ROUTES.jobDetail(j.id))}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><Briefcase className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{j.title}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-ink-muted">
                    {j.company}{j.location ? <><MapPin className="h-3 w-3" /> {j.location}</> : null}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" isLoading={saveJob.isPending && saveJob.variables === j.id} onClick={() => saveJob.mutate(j.id)}>
                <Bookmark className="h-4 w-4" /> Save
              </Button>
            </RecChip>
          ))}
          <button onClick={() => navigate(ROUTES.planSponsorship)} className="flex items-center gap-1 text-xs font-medium text-coral hover:underline">
            More jobs <ChevronRight className="h-3 w-3" />
          </button>
        </Section>
      )}
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RecChip({ children, onHide, onMore }: { children: React.ReactNode; onHide: () => void; onMore?: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="group flex items-center gap-2 rounded-xl border border-sand-border bg-sand-card p-2.5">
      {children}
      <div className="flex items-center gap-0.5">
        {onMore && (
          <button onClick={onMore} title="Show more like this" className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5" aria-label="Show more like this">
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
        <button onClick={onHide} title="Not interested" className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-rose-500" aria-label="Not interested">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
