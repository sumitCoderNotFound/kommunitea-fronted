import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Link2, UserPlus, Users, Sparkles, FileText, PenSquare } from "lucide-react";
import { PostCard } from "@/features/posts/PostCard";
import { RightRail } from "@/features/feed/RightRail";
import { EmailVerificationBanner } from "@/features/auth/EmailVerificationBanner";
import { StoriesBar } from "@/features/stories/StoriesBar";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/utils/cn";
import { listStagger, popIn, springy } from "@/utils/motion";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useFeed, useToggleLike, useToggleSave } from "@/hooks/usePosts";
import { ROUTES } from "@/constants";

const TABS = [
  { key: "for-you", label: "For You" },
  { key: "following", label: "Following" },
  { key: "communities", label: "Communities" },
  { key: "jobs", label: "Jobs" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function FeedPage() {
  const [tab, setTab] = useState<TabKey>("for-you");
  const { user } = useAuthStore();
  const setCreatePostOpen = useUIStore((s) => s.setCreatePostOpen);
  const setImportOpen = useUIStore((s) => s.setImportOpen);

  const { data: allPosts, isLoading } = useFeed();
  const like = useToggleLike();
  const save = useToggleSave();

  // "Following" needs the set of people the user follows — fetched only when needed.
  const { data: following = [] } = useQuery({
    queryKey: ["following-ids", user?.id],
    queryFn: () => profileService.following(String(user?.id)),
    enabled: tab === "following" && !!user?.id,
  });
  const followingIds = new Set(following.map((u) => String(u.id)));

  const posts = (allPosts ?? []).filter((p) => {
    if (tab === "following") return followingIds.has(String(p.author.id));
    if (tab === "communities") return p.visibility === "community_only";
    if (tab === "jobs") return p.category === "jobs" || p.category === "internships";
    return true;
  });

  const showJobDisclaimer = tab === "jobs";

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 w-full max-w-[640px] space-y-4">
        <EmailVerificationBanner />
        <StoriesBar />

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={springy}>
          <Card className="flex items-center gap-3 p-4">
            <Avatar name={user?.fullName ?? "You"} src={user?.avatarUrl} />
            <button onClick={() => setCreatePostOpen(true)}
              className="flex-1 rounded-xl border border-sand-border bg-sand px-4 py-2.5 text-left text-sm text-ink-muted transition-colors hover:border-coral">
              Share something with the tribe...
            </button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setCreatePostOpen(true)} className="hidden sm:inline-flex"><Plus className="h-4 w-4" /> Post</Button>
            </motion.div>
            <button onClick={() => setImportOpen(true)} aria-label="Import from link" title="Import from link"
              className="rounded-xl border border-sand-border p-2.5 text-ink-soft transition-colors hover:border-coral hover:text-coral">
              <Link2 className="h-4 w-4" />
            </button>
          </Card>
        </motion.div>

        {/* Feed tabs */}
        <div className="flex gap-1 border-b border-sand-border">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("relative px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.key ? "text-coral" : "text-ink-muted hover:text-ink")}>
              {t.label}
              {tab === t.key && <motion.div layoutId="feed-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-coral" />}
            </button>
          ))}
        </div>

        {showJobDisclaimer && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Kommunitea does not guarantee the accuracy of job postings. Please do your own due diligence before applying or sharing personal details.
          </div>
        )}

        {isLoading ? (
          <Loader label="Loading the feed..." />
        ) : posts.length === 0 ? (
          <WelcomeEmptyState tab={tab} onCreate={() => setCreatePostOpen(true)} />
        ) : (
          <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-4">
            {posts.map((post) => (
              <motion.div key={post.id} variants={popIn} layout>
                <PostCard post={post} onLike={(id) => like.mutate(id)} onSave={(id) => save.mutate(id)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <RightRail />
    </div>
  );
}

function WelcomeEmptyState({ tab, onCreate }: { tab: TabKey; onCreate: () => void }) {
  const navigate = useNavigate();
  if (tab === "following") {
    return (
      <EmptyShell title="Posts from people you follow" subtitle="Follow members to see their posts here.">
        <Button onClick={() => navigate(ROUTES.tribe)} variant="secondary"><UserPlus className="h-4 w-4" /> Find people</Button>
      </EmptyShell>
    );
  }
  if (tab === "communities") {
    return (
      <EmptyShell title="Community posts" subtitle="Join communities to see their posts in this tab.">
        <Button onClick={() => navigate(ROUTES.tribe)} variant="secondary"><Users className="h-4 w-4" /> Browse communities</Button>
      </EmptyShell>
    );
  }
  if (tab === "jobs") {
    return (
      <EmptyShell title="No job posts yet" subtitle="Job and internship posts from the tribe will show here.">
        <Button onClick={() => navigate(ROUTES.plan)} variant="secondary"><FileText className="h-4 w-4" /> Open Plan</Button>
      </EmptyShell>
    );
  }
  return (
    <EmptyShell title="Welcome to your Kommunitea feed" subtitle="Get started in a few clicks:">
      <Button onClick={onCreate}><PenSquare className="h-4 w-4" /> Create your first post</Button>
      <Button onClick={() => navigate(ROUTES.tribe)} variant="secondary"><UserPlus className="h-4 w-4" /> Follow people</Button>
      <Button onClick={() => navigate(ROUTES.tribe)} variant="secondary"><Users className="h-4 w-4" /> Join communities</Button>
      <Button onClick={() => navigate(ROUTES.studyMatch)} variant="secondary"><Sparkles className="h-4 w-4" /> Explore Study Match</Button>
      <Button onClick={() => navigate(ROUTES.plan)} variant="secondary"><FileText className="h-4 w-4" /> Save a job to Plan</Button>
    </EmptyShell>
  );
}

function EmptyShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="p-8 text-center">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>
    </Card>
  );
}
