import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, Briefcase, GraduationCap, Film, FileText, UserPlus, Play, MapPin, Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { CommunityCard } from "@/features/tribe/CommunityCard";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { profileService } from "@/services/profileService";
import { communityService } from "@/services/communityService";
import { jobService } from "@/services/jobService";
import { postService } from "@/services/postService";
import { clipsService } from "@/services/clipsService";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

const TABS = [
  { key: "foryou", label: "For You", icon: Search },
  { key: "people", label: "People", icon: Users },
  { key: "communities", label: "Communities", icon: Users },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "study", label: "Study", icon: GraduationCap },
  { key: "clips", label: "Clips", icon: Film },
  { key: "posts", label: "Posts", icon: FileText },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function ExplorePage() {
  const [tab, setTab] = useState<TabKey>("foryou");
  const [q, setQ] = useState("");
  const term = useDebounce(q.trim(), 350);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus
          placeholder="Search people, communities, jobs, universities, clips…"
          className="h-12 w-full rounded-2xl border border-sand-border bg-sand-card pl-12 pr-4 text-sm focus-visible:focus-ring" />
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-sand-border">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.key ? "text-coral" : "text-ink-muted hover:text-ink")}>
            {t.label}
            {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-coral" />}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "foryou" && <ForYou term={term} navigate={navigate} />}
        {tab === "people" && <PeopleResults term={term} />}
        {tab === "communities" && <CommunityResults term={term} />}
        {tab === "jobs" && <JobResults term={term} navigate={navigate} />}
        {tab === "study" && <StudyShortcuts navigate={navigate} />}
        {tab === "clips" && <ClipResults term={term} navigate={navigate} />}
        {tab === "posts" && <PostResults term={term} navigate={navigate} />}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-6 font-display text-sm font-semibold text-ink first:mt-0">{children}</h3>;
}

function ForYou({ term, navigate }: { term: string; navigate: ReturnType<typeof useNavigate> }) {
  const people = useQuery({ queryKey: ["explore-people", term], queryFn: () => profileService.list({ search: term }) });
  const communities = useQuery({ queryKey: ["explore-comm", term], queryFn: () => communityService.list(term ? { search: term } : {}) });
  const clips = useQuery({ queryKey: ["explore-clips", term], queryFn: () => clipsService.explore(term ? { search: term } : {}) });

  const peopleList = (people.data?.results ?? []).slice(0, 4);
  const commList = (communities.data?.results ?? []).slice(0, 4);
  const clipList = (clips.data?.clips ?? []).slice(0, 6);

  return (
    <div>
      <SectionTitle>Trending clips</SectionTitle>
      {clips.isLoading ? <Loader /> : clipList.length === 0 ? (
        <p className="text-sm text-ink-muted">No clips yet — be the first to share one.</p>
      ) : <ClipGrid clips={clipList} navigate={navigate} />}

      <SectionTitle>People to follow</SectionTitle>
      {peopleList.length === 0 ? <p className="text-sm text-ink-muted">No suggestions.</p> : (
        <div className="grid gap-3 sm:grid-cols-2">{peopleList.map((u) => <PersonRow key={u.id} u={u} />)}</div>
      )}

      <SectionTitle>Communities to join</SectionTitle>
      <CommunityGrid communities={commList} />

      <SectionTitle>Study Match</SectionTitle>
      <StudyShortcuts navigate={navigate} />
    </div>
  );
}

function PersonRow({ u }: { u: any }) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <Link to={ROUTES.profile(u.id)}><Avatar name={u.fullName} src={u.avatarUrl} size="sm" /></Link>
      <div className="min-w-0 flex-1">
        <Link to={ROUTES.profile(u.id)} className="block truncate text-sm font-medium hover:underline">{u.fullName}</Link>
        <p className="truncate text-xs text-ink-muted">{u.university || u.city || "Member"}</p>
      </div>
      <Link to={ROUTES.profile(u.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-coral hover:bg-coral/10"><UserPlus className="h-4 w-4" /></Link>
    </Card>
  );
}

function PeopleResults({ term }: { term: string }) {
  const { data, isLoading } = useQuery({ queryKey: ["explore-people-tab", term], queryFn: () => profileService.list({ search: term }) });
  const list = data?.results ?? [];
  if (isLoading) return <Loader />;
  if (list.length === 0) return <p className="text-sm text-ink-muted">No people found.</p>;
  return <div className="grid gap-3 sm:grid-cols-2">{list.map((u) => <PersonRow key={u.id} u={u} />)}</div>;
}

function CommunityResults({ term }: { term: string }) {
  const { data, isLoading } = useQuery({ queryKey: ["explore-comm-tab", term], queryFn: () => communityService.list(term ? { search: term } : {}) });
  const list = data?.results ?? [];
  if (isLoading) return <Loader />;
  if (list.length === 0) return <p className="text-sm text-ink-muted">No communities found.</p>;
  return <CommunityGrid communities={list} />;
}

function CommunityGrid({ communities }: { communities: any[] }) {
  const qc = useQueryClient();
  const toast = useToast();
  const join = useMutation({
    mutationFn: (id: string) => communityService.join(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["explore-comm"] });
      qc.invalidateQueries({ queryKey: ["explore-comm-tab"] });
      toast.success("Joined community");
    },
    onError: (e) => toast.error("Couldn't join: " + (e as Error).message),
  });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {communities.map((c) => (
        <CommunityCard key={c.id} community={c} joining={join.isPending && join.variables === c.id}
          onToggleJoin={(comm) => !comm.isMember && join.mutate(comm.id)} />
      ))}
    </div>
  );
}

function JobResults({ term, navigate }: { term: string; navigate: ReturnType<typeof useNavigate> }) {
  const { data, isLoading } = useQuery({ queryKey: ["explore-jobs-tab", term], queryFn: () => jobService.list(term ? { search: term } : {}) });
  const list = data?.results ?? [];
  if (isLoading) return <Loader />;
  if (list.length === 0) return <p className="text-sm text-ink-muted">No jobs found.</p>;
  return (
    <div className="space-y-3">
      {list.map((j: any) => (
        <Card key={j.id} className="flex items-center gap-3 p-4 hover:border-coral cursor-pointer" onClick={() => navigate(ROUTES.jobDetail(j.id))}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand"><Briefcase className="h-5 w-5 text-coral" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{j.title}</p>
            <p className="truncate text-xs text-ink-muted">{[j.company, j.location].filter(Boolean).join(" · ")}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StudyShortcuts({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const items = [
    { label: "Compare countries", icon: GraduationCap, to: ROUTES.studyMatchCountries },
    { label: "Browse universities", icon: Building2, to: ROUTES.studyMatchUniversities },
    { label: "UK City Guide", icon: MapPin, to: ROUTES.studyMatchCities },
    { label: "Find my match", icon: Search, to: ROUTES.studyMatchWizard },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="flex cursor-pointer flex-col items-center gap-2 p-4 text-center hover:border-coral" onClick={() => navigate(it.to)}>
          <it.icon className="h-6 w-6 text-coral" />
          <span className="text-xs font-medium text-ink">{it.label}</span>
        </Card>
      ))}
    </div>
  );
}

function ClipResults({ term, navigate }: { term: string; navigate: ReturnType<typeof useNavigate> }) {
  const { data, isLoading } = useQuery({ queryKey: ["explore-clips-tab", term], queryFn: () => clipsService.explore(term ? { search: term } : {}) });
  const list = data?.clips ?? [];
  if (isLoading) return <Loader />;
  if (list.length === 0) return <p className="text-sm text-ink-muted">No clips found.</p>;
  return <ClipGrid clips={list} navigate={navigate} />;
}

function ClipGrid({ clips, navigate }: { clips: any[]; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {clips.map((c) => (
        <button key={c.id} onClick={() => navigate(`${ROUTES.clips}?start=${c.id}`)}
          className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-ink/80">
          {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coral/30 to-ink/40"><Play className="h-6 w-6 text-white" /></div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
            <p className="line-clamp-2 text-[11px] font-medium text-white">{c.caption || c.category}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function PostResults({ term, navigate }: { term: string; navigate: ReturnType<typeof useNavigate> }) {
  const { data, isLoading } = useQuery({ queryKey: ["explore-posts-tab", term], queryFn: () => postService.list(term ? { search: term } : {}) });
  const list = data?.results ?? [];
  if (isLoading) return <Loader />;
  if (list.length === 0) return <p className="text-sm text-ink-muted">No posts found.</p>;
  return (
    <div className="space-y-3">
      {list.map((p: any) => (
        <Card key={p.id} className="cursor-pointer p-4 hover:border-coral" onClick={() => navigate(ROUTES.postDetail(p.id))}>
          <div className="flex items-center gap-2">
            <Avatar name={p.author.fullName} src={p.author.avatarUrl} size="xs" />
            <span className="text-xs font-medium">{p.author.fullName}</span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-ink">{p.body}</p>
        </Card>
      ))}
    </div>
  );
}
